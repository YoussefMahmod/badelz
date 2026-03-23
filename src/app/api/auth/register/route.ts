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

    const { name, email, password, phone } = parsed.data;

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

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone ?? null,
        role: "VENUE_OWNER",
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

    return NextResponse.json(
      {
        statusCode: 201,
        message: "تم إنشاء الحساب بنجاح",
        data: user,
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
