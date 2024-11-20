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

    const appointments = await prisma.appointment.findMany({
      where: {
        pharmacyId: pharmacy.id,
      },
      include: {
        patient: {
          select: {
            name: true,
          },
        },
        doctor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching pharmacy appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
