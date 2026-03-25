import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { statusCode: 400, message: "بيانات ناقصة", data: null },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { statusCode: 400, message: "كلمة المرور لازم تكون 6 أحرف على الأقل", data: null },
        { status: 400 }
      );
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { statusCode: 400, message: "اللينك ده مش صحيح أو انتهت صلاحيته", data: null },
        { status: 400 }
      );
    }

    if (resetRecord.usedAt) {
      return NextResponse.json(
        { statusCode: 400, message: "اللينك ده اتستخدم قبل كده", data: null },
        { status: 400 }
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { statusCode: 400, message: "اللينك ده انتهت صلاحيته. اطلب واحد جديد.", data: null },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      statusCode: 200,
      message: "تم تغيير كلمة المرور بنجاح",
      data: null,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
