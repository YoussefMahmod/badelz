import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { playerProfileUpdateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "غير مصرح", data: null },
        { status: 401 }
      );
    }

    if (session.user.role !== "PLAYER") {
      return NextResponse.json(
        { statusCode: 403, message: "هذا الإندبوينت للاعبين فقط", data: null },
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
        role: true,
        createdAt: true,
        playerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { statusCode: 404, message: "المستخدم غير موجود", data: null },
        { status: 404 }
      );
    }

    const profile = user.playerProfile;

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب البيانات",
      data: {
        id: user.id,
        name: profile?.name ?? user.name,
        nameAr: profile?.nameAr ?? null,
        email: user.email,
        phone: profile?.phone ?? user.phone,
        area: profile?.area ?? null,
        areaAr: profile?.areaAr ?? null,
        avatar: profile?.avatar ?? null,
        gamesPlayed: profile?.gamesPlayed ?? 0,
        gamesWon: profile?.gamesWon ?? 0,
        rating: profile ? Number(profile.rating) : 0,
        tier: profile?.tier ?? "BRONZE",
        memberSince: profile?.createdAt ?? user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get player profile error:", error);
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

    if (session.user.role !== "PLAYER") {
      return NextResponse.json(
        { statusCode: 403, message: "هذا الإندبوينت للاعبين فقط", data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = playerProfileUpdateSchema.safeParse(body);

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

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { statusCode: 404, message: "بروفايل اللاعب غير موجود", data: null },
        { status: 404 }
      );
    }

    // Build update payload from only the fields that were provided
    const updateData: Record<string, unknown> = {};
    const { name, nameAr, area, areaAr, avatar } = parsed.data;
    if (name !== undefined) updateData.name = name;
    if (nameAr !== undefined) updateData.nameAr = nameAr;
    if (area !== undefined) updateData.area = area;
    if (areaAr !== undefined) updateData.areaAr = areaAr;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Sync name to User table if changed
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    const updated = await prisma.playerProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم تحديث البيانات",
      data: {
        id: updated.id,
        name: updated.name,
        nameAr: updated.nameAr,
        area: updated.area,
        areaAr: updated.areaAr,
        avatar: updated.avatar,
        gamesPlayed: updated.gamesPlayed,
        gamesWon: updated.gamesWon,
        rating: Number(updated.rating),
        tier: updated.tier,
      },
    });
  } catch (error) {
    console.error("Update player profile error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
