import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courtPriceRulesSchema } from "@/lib/validators";
import { timeToMinutes, endTimeToMinutes } from "@/lib/slot-templates";

type RouteParams = { params: Promise<{ id: string; courtId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { courtId } = await params;

    const rules = await prisma.courtPriceRule.findMany({
      where: { courtId },
      orderBy: [{ dayGroup: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب قواعد التسعير",
      data: rules.map((r) => ({
        id: r.id,
        dayGroup: r.dayGroup,
        startTime: r.startTime,
        endTime: r.endTime,
        pricePerHour: r.pricePerHour,
      })),
    });
  } catch (error) {
    console.error("Get price rules error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: venueId, courtId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    // Verify ownership
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: { venue: { select: { ownerId: true } } },
    });

    if (!court || court.venueId !== venueId) {
      return NextResponse.json(
        { statusCode: 404, message: "الكورت غير موجود", data: null },
        { status: 404 }
      );
    }

    if (court.venue.ownerId !== session.user.id && (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json(
        { statusCode: 403, message: "غير مصرح لك", data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = courtPriceRulesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { statusCode: 400, message: "بيانات غير صحيحة", data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Validate: startTime < endTime for each rule (endTime "00:00" = midnight = 1440)
    for (const rule of parsed.data.rules) {
      if (timeToMinutes(rule.startTime) >= endTimeToMinutes(rule.endTime)) {
        return NextResponse.json(
          { statusCode: 400, message: `وقت البداية ${rule.startTime} لازم يكون قبل وقت النهاية ${rule.endTime}`, data: null },
          { status: 400 }
        );
      }
    }

    // Validate: no overlapping time ranges within same dayGroup
    const byGroup = new Map<string, typeof parsed.data.rules>();
    for (const rule of parsed.data.rules) {
      const group = byGroup.get(rule.dayGroup) || [];
      group.push(rule);
      byGroup.set(rule.dayGroup, group);
    }

    for (const [, groupRules] of byGroup) {
      const sorted = groupRules.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      for (let i = 1; i < sorted.length; i++) {
        if (timeToMinutes(sorted[i].startTime) < endTimeToMinutes(sorted[i - 1].endTime)) {
          return NextResponse.json(
            { statusCode: 400, message: "يوجد تداخل في أوقات التسعير", data: null },
            { status: 400 }
          );
        }
      }
    }

    // Replace all rules in a transaction
    const result = await prisma.$transaction(async (tx) => {
      await tx.courtPriceRule.deleteMany({ where: { courtId } });

      if (parsed.data.rules.length === 0) return [];

      await tx.courtPriceRule.createMany({
        data: parsed.data.rules.map((r) => ({
          courtId,
          dayGroup: r.dayGroup,
          startTime: r.startTime,
          endTime: r.endTime,
          pricePerHour: r.pricePerHour,
        })),
      });

      return tx.courtPriceRule.findMany({
        where: { courtId },
        orderBy: [{ dayGroup: "asc" }, { startTime: "asc" }],
      });
    });

    return NextResponse.json({
      statusCode: 200,
      message: "تم حفظ قواعد التسعير",
      data: result.map((r) => ({
        id: r.id,
        dayGroup: r.dayGroup,
        startTime: r.startTime,
        endTime: r.endTime,
        pricePerHour: r.pricePerHour,
      })),
    });
  } catch (error) {
    console.error("Update price rules error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
