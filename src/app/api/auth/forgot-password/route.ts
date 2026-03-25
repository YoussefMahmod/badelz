import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";
import { sendPasswordResetEmail } from "@/lib/email";

const generateToken = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  32
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { statusCode: 400, message: "البريد الإلكتروني مطلوب", data: null },
        { status: 400 }
      );
    }

    // Always return success to avoid leaking whether the email exists
    const successResponse = NextResponse.json({
      statusCode: 200,
      message: "لو الإيميل موجود عندنا، هتوصلك رسالة فيها لينك إعادة تعيين كلمة المرور",
      data: null,
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return successResponse;

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "https://badelz.app";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    sendPasswordResetEmail(email, { resetLink }).catch((err) =>
      console.error("Password reset email failed:", err)
    );

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
