import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminCreatePlayerSchema } from "@/lib/admin-validators";
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
    const parsed = adminCreatePlayerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { statusCode: 400, message: "Invalid data", data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check phone uniqueness
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { phone: data.phone },
    });
    if (existingProfile) {
      return NextResponse.json(
        { statusCode: 409, message: "Phone already exists", data: null },
        { status: 409 }
      );
    }

    let plainPassword: string | null = null;
    let whatsappLink: string | null = null;

    const result = await prisma.$transaction(async (tx) => {
      let userId: string | undefined;

      // If email provided, create a User account
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
            role: "PLAYER",
            isOnboarded: true,
            locale: "ar",
          },
        });
        userId = user.id;
      }

      const profile = await tx.playerProfile.create({
        data: {
          phone: data.phone,
          name: data.name,
          nameAr: data.name,
          area: data.area || undefined,
          areaAr: data.areaAr || undefined,
          avatar: data.avatar || undefined,
          gamesPlayed: data.gamesPlayed,
          gamesWon: data.gamesWon,
          rating: data.rating,
          tier: data.tier,
          isEarlyAdopter: data.isEarlyAdopter,
          ...(userId ? { userId } : {}),
        },
      });

      return { profile, userId };
    });

    if (plainPassword) {
      const message = `أهلاً ${data.name}! حسابك على بادلز جاهز 🏸
الإيميل: ${data.email}
الباسورد: ${plainPassword}
ادخل هنا: https://badelz.app/login`;
      whatsappLink = buildWhatsAppDirectLink(data.phone, message);
    }

    return NextResponse.json(
      {
        statusCode: 201,
        message: "Player created successfully",
        data: {
          player: result.profile,
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
    console.error("Admin create player error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
