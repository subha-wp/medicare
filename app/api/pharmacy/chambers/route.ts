// @ts-nocheck
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();

  if (!user || user.role !== "PHARMACY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { userId: user.id },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    const chambers = await prisma.chamber.findMany({
      where: {
        pharmacyId: pharmacy.id,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
          },
        },
      },
    });

    return NextResponse.json(chambers);
  } catch (error) {
    console.error("Error fetching pharmacy chambers:", error);
    return NextResponse.json(
      { error: "Failed to fetch chambers" },
      { status: 500 }
    );
  }
}
