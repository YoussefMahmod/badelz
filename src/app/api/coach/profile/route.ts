import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coachProfileUpdateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "غير مصرح", data: null },
        { status: 401 }
      );
    }

    if (session.user.role !== "COACH") {
      return NextResponse.json(
        { statusCode: 403, message: "هذا الإندبوينت للمدربين فقط", data: null },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        coachProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { statusCode: 404, message: "المستخدم غير موجود", data: null },
        { status: 404 }
      );
    }

    const coach = user.coachProfile;

    if (!coach) {
      return NextResponse.json(
        { statusCode: 404, message: "بروفايل المدرب غير موجود", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب البيانات",
      data: {
        id: coach.id,
        userId: user.id,
        name: coach.name,
        nameAr: coach.nameAr,
        email: user.email,
        phone: coach.phone,
        whatsapp: coach.whatsapp,
        bio: coach.bio,
        bioAr: coach.bioAr,
        photo: coach.photo,
        areas: coach.areas,
        areasAr: coach.areasAr,
        pricePerHour: coach.pricePerHour ? Number(coach.pricePerHour) : null,
        experience: coach.experience,
        isActive: coach.isActive,
        viewCount: coach.viewCount,
        whatsappClicks: coach.whatsappClicks,
        heartCount: coach.heartCount,
        createdAt: coach.createdAt,
      },
    });
  } catch (error) {
    console.error("Get coach profile error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "غير مصرح", data: null },
        { status: 401 }
      );
    }

    if (session.user.role !== "COACH") {
      return NextResponse.json(
        { statusCode: 403, message: "هذا الإندبوينت للمدربين فقط", data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = coachProfileUpdateSchema.safeParse(body);

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

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json(
        { statusCode: 404, message: "بروفايل المدرب غير موجود", data: null },
        { status: 404 }
      );
    }

    // Build update payload from only the fields that were provided
    const updateData: Record<string, unknown> = {};
    const {
      name,
      nameAr,
      bio,
      bioAr,
      photo,
      areas,
      areasAr,
      pricePerHour,
      experience,
      whatsapp,
      isActive,
    } = parsed.data;

    if (name !== undefined) updateData.name = name;
    if (nameAr !== undefined) updateData.nameAr = nameAr;
    if (bio !== undefined) updateData.bio = bio;
    if (bioAr !== undefined) updateData.bioAr = bioAr;
    if (photo !== undefined) updateData.photo = photo;
    if (areas !== undefined) updateData.areas = areas;
    if (areasAr !== undefined) updateData.areasAr = areasAr;
    if (pricePerHour !== undefined) updateData.pricePerHour = pricePerHour;
    if (experience !== undefined) updateData.experience = experience;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Sync name to User table if changed
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    const updated = await prisma.coach.update({
      where: { id: coach.id },
      data: updateData,
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم تحديث البيانات",
      data: {
        id: updated.id,
        name: updated.name,
        nameAr: updated.nameAr,
        phone: updated.phone,
        whatsapp: updated.whatsapp,
        bio: updated.bio,
        bioAr: updated.bioAr,
        photo: updated.photo,
        areas: updated.areas,
        areasAr: updated.areasAr,
        pricePerHour: updated.pricePerHour ? Number(updated.pricePerHour) : null,
        experience: updated.experience,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error("Update coach profile error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
