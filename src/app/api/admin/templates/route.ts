import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyTemplateSchema } from "@/lib/admin-validators";
import { expandTemplate } from "@/lib/slot-templates";

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
    const parsed = applyTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { statusCode: 400, message: "Invalid data", data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { templateId, courtIds } = parsed.data;
    const slotData = expandTemplate(templateId, courtIds);

    if (slotData.length === 0) {
      return NextResponse.json(
        { statusCode: 400, message: "No slots to create", data: null },
        { status: 400 }
      );
    }

    const result = await prisma.timeSlot.createMany({
      data: slotData,
      skipDuplicates: true,
    });

    return NextResponse.json({
      statusCode: 201,
      message: "Template applied",
      data: { slotsCreated: result.count },
    });
  } catch (error) {
    console.error("Apply template error:", error);
    return NextResponse.json(
      { statusCode: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
