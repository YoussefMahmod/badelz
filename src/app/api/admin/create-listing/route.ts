import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminCreateListingSchema } from "@/lib/admin-validators";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { statusCode: 403, message: "Admin access required", data: null },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = adminCreateListingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { statusCode: 400, message: "Invalid data", data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const listing = await prisma.listing.create({
      data: {
        sellerName: data.sellerName,
        sellerPhone: data.sellerPhone,
        title: data.title,
        titleAr: data.titleAr || undefined,
        description: data.description || undefined,
        descriptionAr: data.descriptionAr || undefined,
        price: data.price,
        category: data.category,
        condition: data.condition,
        photos: data.photos || [],
        area: data.area,
        areaAr: data.areaAr || undefined,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        statusCode: 201,
        message: "Listing created successfully",
        data: { listing },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin create listing error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
