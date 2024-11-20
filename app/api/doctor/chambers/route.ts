import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();

  if (!user || user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const chambers = await prisma.chamber.findMany({
      where: {
        doctorId: doctor.id,
      },
      include: {
        pharmacy: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json(chambers);
  } catch (error) {
    console.error("Error fetching doctor chambers:", error);
    return NextResponse.json(
      { error: "Failed to fetch chambers" },
      { status: 500 }
    );
  }
}
