import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { statusCode: 403, message: "Admin access required", data: null },
        { status: 403 }
      );
    }

    const { id } = await params;

    const venue = await prisma.venue.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!venue) {
      return NextResponse.json(
        { statusCode: 404, message: "Venue not found", data: null },
        { status: 404 }
      );
    }

    const updated = await prisma.venue.update({
      where: { id },
      data: { isActive: !venue.isActive },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({
      statusCode: 200,
      message: updated.isActive ? "Venue activated" : "Venue deactivated",
      data: updated,
    });
  } catch (error) {
    console.error("Toggle venue error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
