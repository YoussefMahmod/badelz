import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "بيانات غير صحيحة",
          data: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      phone,
      role,
      area,
      areas,
      bio,
      pricePerHour,
      experience,
    } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        {
          statusCode: 409,
          message: "البريد الإلكتروني مسجل بالفعل",
          data: null,
        },
        { status: 409 }
      );
    }

    // Phone is required for PLAYER and COACH roles
    if ((role === "PLAYER" || role === "COACH") && !phone) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "رقم الموبايل مطلوب للاعبين والمدربين",
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if phone is already linked to a user-owned coach profile
    if (role === "COACH" && phone) {
      const existingCoach = await prisma.coach.findUnique({
        where: { phone },
      });
      if (existingCoach?.userId) {
        return NextResponse.json(
          {
            statusCode: 409,
            message: "رقم الموبايل مسجل بالفعل كمدرب",
            data: null,
          },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Use a transaction to create user + role-specific profile atomically
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone ?? null,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isOnboarded: true,
          createdAt: true,
        },
      });

      // Create or link PlayerProfile for PLAYER role
      if (role === "PLAYER" && phone) {
        await tx.playerProfile.upsert({
          where: { phone },
          update: {
            userId: user.id,
            name,
            area: area ?? undefined,
          },
          create: {
            phone,
            name,
            userId: user.id,
            area: area ?? null,
          },
        });
      }

      // Create or link Coach profile for COACH role
      if (role === "COACH" && phone) {
        await tx.coach.upsert({
          where: { phone },
          update: {
            userId: user.id,
            name,
            bio: bio ?? undefined,
            areas: areas ?? undefined,
            pricePerHour: pricePerHour ?? undefined,
            experience: experience ?? undefined,
          },
          create: {
            phone,
            name,
            userId: user.id,
            whatsapp: phone,
            bio: bio ?? null,
            areas: areas ?? [],
            areasAr: [],
            pricePerHour: pricePerHour ?? null,
            experience: experience ?? null,
          },
        });
      }

      return user;
    });

    return NextResponse.json(
      {
        statusCode: 201,
        message: "تم إنشاء الحساب بنجاح",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: "حدث خطأ في السيرفر",
        data: null,
      },
      { status: 500 }
    );
  }
}
