import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pharmacyId: string }> }
) {
  const { pharmacyId } = await params;
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chambers = await prisma.chamber.findMany({
      where: {
        pharmacyId: pharmacyId,
        isActive: true,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            qualification: true,
            avatarUrl: true,
          },
        },
        pharmacy: {
          select: {
            name: true,
            address: true,
            location: true,
            businessName: true,
          },
        },
      },
      orderBy: [
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
