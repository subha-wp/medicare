import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  const { doctorId } = await params;
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chambers = await prisma.chamber.findMany({
      where: {
        doctorId: doctorId,
        isActive: true,
      },
      include: {
        pharmacy: {
          select: {
            businessName: true,
            address: true,
          },
        },
      },
      orderBy: [
        {
          weekNumber: "asc",
        },
        {
          weekDay: "asc",
        },
      ],
    });

    return NextResponse.json({ chambers });
  } catch (error) {
    console.error("Error fetching chambers:", error);
    return NextResponse.json(
      { error: "Failed to fetch chambers" },
      { status: 500 }
    );
  }
}
