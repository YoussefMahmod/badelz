import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // ─── Mode 1: Category counts ───
    if (searchParams.get("counts") === "true") {
      const counts = await prisma.listing.groupBy({
        by: ["category"],
        where: { status: "ACTIVE" },
        _count: { id: true },
      });
      const result: Record<string, number> = {};
      counts.forEach((c) => {
        result[c.category] = c._count.id;
      });
      return NextResponse.json({ statusCode: 200, data: result });
    }

    // ─── Mode 2: Trending (top 6 most-viewed) ───
    if (searchParams.get("trending") === "true") {
      const trending = await prisma.listing.findMany({
        where: { status: "ACTIVE" },
        orderBy: { views: "desc" },
        take: 6,
      });
      return NextResponse.json({ statusCode: 200, data: trending });
    }

    // ─── Mode 3: Recently added ───
    if (searchParams.get("recent") === "true") {
      const recentLimit = parseInt(searchParams.get("limit") || "10");
      const recent = await prisma.listing.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: Math.min(recentLimit, 20),
      });
      return NextResponse.json({ statusCode: 200, data: recent });
    }

    // ─── Main query with filters ───
    const category = searchParams.get("category");
    const area = searchParams.get("area");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") ?? "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = { status: "ACTIVE" };

    if (category) {
      where.category = category as Prisma.EnumListingCategoryFilter;
    }

    if (area) {
      where.area = area;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { titleAr: { contains: search, mode: "insensitive" } },
      ];
    }

    // Determine sort order
    let orderBy: Prisma.ListingOrderByWithRelationInput;
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      statusCode: 200,
      message: "تم جلب البيانات بنجاح",
      data: listings,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("List market error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, message: "سجل دخولك الأول عشان تبيع", data: null },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = listingSchema.safeParse(body);

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

    const listing = await prisma.listing.create({
      data: {
        sellerId: session.user.id,
        sellerName: parsed.data.sellerName,
        sellerPhone: parsed.data.sellerPhone,
        title: parsed.data.title,
        titleAr: parsed.data.titleAr,
        description: parsed.data.description,
        descriptionAr: parsed.data.descriptionAr,
        price: parsed.data.price,
        category: parsed.data.category,
        condition: parsed.data.condition,
        photos: parsed.data.photos ?? [],
        area: parsed.data.area,
        areaAr: parsed.data.areaAr,
      },
    });

    return NextResponse.json(
      { statusCode: 201, message: "تم الإضافة بنجاح", data: listing },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "حدث خطأ في السيرفر", data: null },
      { status: 500 }
    );
  }
}
