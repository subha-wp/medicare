import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();

  if (!user || user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chambers = await prisma.chamber.findMany({
      where: {
        isActive: true,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
          },
        },
        pharmacy: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      take: 10, // Limit to 10 chambers for now
    });

    return NextResponse.json(chambers);
  } catch (error) {
    console.error("Error fetching nearest chambers:", error);
    return NextResponse.json(
      { error: "Failed to fetch nearest chambers" },
      { status: 500 }
    );
  }
}
