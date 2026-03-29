import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quickOnboardSchema } from "@/lib/admin-validators";
import { expandTemplate, presetToScheduleConfig } from "@/lib/slot-templates";
import { buildWhatsAppDirectLink } from "@/lib/whatsapp";

function generatePassword(): string {
  return randomBytes(4).toString("hex"); // 8-char hex string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { statusCode: 403, message: "Admin access required", data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = quickOnboardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { statusCode: 400, message: "Invalid data", data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { owner: ownerData, venue: venueData, courts: courtsData, slotTemplate, scheduleConfig } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: ownerData.email },
    });

    if (existing) {
      return NextResponse.json(
        { statusCode: 409, message: "Email already exists", data: null },
        { status: 409 }
      );
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create owner user
      const user = await tx.user.create({
        data: {
          name: ownerData.name,
          email: ownerData.email,
          phone: ownerData.phone,
          password: hashedPassword,
          role: "VENUE_OWNER",
          isOnboarded: true,
          locale: "ar",
        },
      });

      // 2. Create venue
      const venue = await tx.venue.create({
        data: {
          ownerId: user.id,
          name: venueData.name,
          nameAr: venueData.nameAr,
          address: venueData.address,
          addressAr: venueData.addressAr,
          city: venueData.city,
          cityAr: venueData.cityAr,
          phone: venueData.phone,
          whatsapp: venueData.whatsapp,
          latitude: venueData.latitude,
          longitude: venueData.longitude,
          sportTypes: ["PADEL"],
          isFoundingVenue: true,
        },
      });

      // 3. Create courts
      const courts = [];
      for (let i = 0; i < courtsData.length; i++) {
        const court = await tx.court.create({
          data: {
            venueId: venue.id,
            name: courtsData[i].name,
            nameAr: courtsData[i].nameAr,
            pricePerHour: courtsData[i].pricePerHour,
            sportType: "PADEL",
            sortOrder: i,
          },
        });
        courts.push(court);
      }

      const courtIds = courts.map((c) => c.id);
      let schedulesCreated = 0;

      // 4. Create schedule templates (new system) or fallback to legacy slots
      if (scheduleConfig) {
        // New: create ScheduleTemplate rows from custom config
        const dayGroups: { dayGroup: string; startTime: string; endTime: string }[] = [];

        if (scheduleConfig.all) {
          dayGroups.push({ dayGroup: "all", ...scheduleConfig.all });
        } else {
          if (scheduleConfig.weekdays) {
            dayGroups.push({ dayGroup: "weekdays", ...scheduleConfig.weekdays });
          }
          if (scheduleConfig.weekends) {
            dayGroups.push({ dayGroup: "weekends", ...scheduleConfig.weekends });
          }
        }

        for (const courtId of courtIds) {
          for (const dg of dayGroups) {
            await tx.scheduleTemplate.create({
              data: {
                courtId,
                dayGroup: dg.dayGroup,
                startTime: dg.startTime,
                endTime: dg.endTime,
                slotDuration: scheduleConfig.slotDuration ?? 60,
              },
            });
            schedulesCreated++;
          }
        }
      } else if (slotTemplate) {
        // Convert preset to ScheduleTemplate rows
        const configs = presetToScheduleConfig(slotTemplate);
        for (const courtId of courtIds) {
          for (const config of configs) {
            await tx.scheduleTemplate.create({
              data: {
                courtId,
                dayGroup: config.dayGroup,
                startTime: config.startTime,
                endTime: config.endTime,
                slotDuration: config.slotDuration,
              },
            });
            schedulesCreated++;
          }
        }

        // Also create legacy TimeSlots for backward compatibility
        const slotData = expandTemplate(slotTemplate, courtIds);
        if (slotData.length > 0) {
          await tx.timeSlot.createMany({
            data: slotData,
            skipDuplicates: true,
          });
        }
      }

      return { user, venue, courts, schedulesCreated };
    });

    // Build WhatsApp credentials message
    const message = `مرحبا ${result.user.name}! ملعبك ${result.venue.name} تم تسجيله على بادلز 🏸
الإيميل: ${result.user.email}
الباسورد: ${plainPassword}
ادخل هنا: https://badelz.app/dashboard
غير الباسورد بعد أول تسجيل دخول`;

    const whatsappLink = buildWhatsAppDirectLink(ownerData.phone, message);

    return NextResponse.json(
      {
        statusCode: 201,
        message: "Venue onboarded successfully",
        data: {
          owner: { id: result.user.id, name: result.user.name, email: result.user.email },
          venue: { id: result.venue.id, name: result.venue.name },
          courtsCreated: result.courts.length,
          schedulesCreated: result.schedulesCreated,
          generatedPassword: plainPassword,
          whatsappLink,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin onboard error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
