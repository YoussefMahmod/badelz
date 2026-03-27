import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminCreateCoachSchema } from "@/lib/admin-validators";
import { buildWhatsAppDirectLink } from "@/lib/whatsapp";

function generatePassword(): string {
  return randomBytes(4).toString("hex");
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
    const parsed = adminCreateCoachSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { statusCode: 400, message: "Invalid data", data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check phone uniqueness
    const existingCoach = await prisma.coach.findUnique({
      where: { phone: data.phone },
    });
    if (existingCoach) {
      return NextResponse.json(
        { statusCode: 409, message: "Coach phone already exists", data: null },
        { status: 409 }
      );
    }

    let plainPassword: string | null = null;
    let whatsappLink: string | null = null;

    const result = await prisma.$transaction(async (tx) => {
      let userId: string | undefined;

      if (data.email) {
        const existingUser = await tx.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
          throw new Error("EMAIL_EXISTS");
        }

        plainPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 12);

        const user = await tx.user.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            role: "COACH",
            isOnboarded: true,
            locale: "ar",
          },
        });
        userId = user.id;
      }

      const coach = await tx.coach.create({
        data: {
          name: data.name,
          nameAr: data.nameAr || undefined,
          phone: data.phone,
          whatsapp: data.whatsapp || undefined,
          bio: data.bio || undefined,
          bioAr: data.bioAr || undefined,
          photo: data.photo || undefined,
          areas: data.areas,
          areasAr: data.areasAr || [],
          pricePerHour: data.pricePerHour || undefined,
          experience: data.experience || undefined,
          isPioneerCoach: data.isPioneerCoach,
          ...(userId ? { userId } : {}),
        },
      });

      return { coach, userId };
    });

    if (plainPassword) {
      const message = `أهلاً كابتن ${data.name}! حسابك على بادلز جاهز 🏸
الإيميل: ${data.email}
الباسورد: ${plainPassword}
ادخل هنا: https://badelz.app/login`;
      whatsappLink = buildWhatsAppDirectLink(data.phone, message);
    }

    return NextResponse.json(
      {
        statusCode: 201,
        message: "Coach created successfully",
        data: {
          coach: result.coach,
          generatedPassword: plainPassword,
          whatsappLink,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return NextResponse.json(
        { statusCode: 409, message: "Email already exists", data: null },
        { status: 409 }
      );
    }
    console.error("Admin create coach error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
