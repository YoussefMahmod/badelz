import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { venueSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    // Filter by owner when ?mine=true
    const mine = searchParams.get("mine");
    if (mine === "true") {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        where.ownerId = session.user.id;
      }
    }

    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
      ];
    }

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rating: "desc" },
        select: {
          id: true,
          name: true,
          nameAr: true,
          description: true,
          descriptionAr: true,
          phone: true,
          whatsapp: true,
          address: true,
          addressAr: true,
          city: true,
          cityAr: true,
          latitude: true,
          longitude: true,
          coverPhoto: true,
          sportTypes: true,
          rating: true,
          ratingCount: true,
          isFoundingVenue: true,
          _count: { select: { courts: { where: { isActive: true } } } },
        },
      }),
      prisma.venue.count({ where }),
    ]);

    const data = venues.map(({ _count, ...venue }) => ({
      ...venue,
      courtCount: _count.courts,
    }));

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب الملاعب بنجاح",
      data,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("List venues error:", error);
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "يجب تسجيل الدخول", data: null },
        { status: 401 }
      );
    }

    if (session.user.role !== "VENUE_OWNER") {
      return NextResponse.json(
        { statusCode: 403, message: "غير مصرح لك بإنشاء ملعب", data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = venueSchema.safeParse(body);

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

    const venue = await prisma.venue.create({
      data: {
        ...parsed.data,
        ownerId: session.user.id,
        sportTypes: ["PADEL"],
      },
    });

    return NextResponse.json(
      {
        statusCode: 201,
        message: "تم إنشاء الملعب بنجاح",
        data: venue,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create venue error:", error);
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
