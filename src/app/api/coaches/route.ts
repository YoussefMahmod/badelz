import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coachSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const area = searchParams.get("area");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.CoachWhereInput = { isActive: true };

    if (area) {
      where.areas = { has: area };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
      ];
    }

    const sort = searchParams.get("sort");
    let orderBy: Prisma.CoachOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "name") {
      orderBy = { name: "asc" };
    } else if (sort === "price") {
      orderBy = { pricePerHour: "asc" };
    } else if (sort === "hearts") {
      orderBy = { heartCount: "desc" } as Prisma.CoachOrderByWithRelationInput;
    }
    // "newest" or default both resolve to createdAt desc

    const [coaches, total] = await Promise.all([
      prisma.coach.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.coach.count({ where }),
    ]);

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب البيانات بنجاح",
      data: coaches,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("List coaches error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = coachSchema.safeParse(body);

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

    // Check phone uniqueness
    const existing = await prisma.coach.findUnique({
      where: { phone: parsed.data.phone },
    });

    if (existing) {
      return NextResponse.json(
        { statusCode: 409, message: "رقم الموبايل مسجل بالفعل", data: null },
        { status: 409 }
      );
    }

    const coach = await prisma.coach.create({
      data: {
        name: parsed.data.name,
        nameAr: parsed.data.nameAr,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp,
        bio: parsed.data.bio,
        bioAr: parsed.data.bioAr,
        areas: parsed.data.areas,
        areasAr: parsed.data.areasAr ?? [],
        pricePerHour: parsed.data.pricePerHour,
        experience: parsed.data.experience,
        isPioneerCoach: true,
      },
    });

    return NextResponse.json(
      { statusCode: 201, message: "تم الإضافة بنجاح", data: coach },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create coach error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
