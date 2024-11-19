import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { user } = await validateRequest();

  if (!user || user.role !== "PHARMACY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const pharmacy = await prisma.pharmacy.findFirst({
      where: { userId: user.id },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy profile not found" },
        { status: 404 }
      );
    }

    // Check for existing chamber with same doctor and timing
    const existingChamber = await prisma.chamber.findFirst({
      where: {
        doctorId: data.doctorId,
        pharmacyId: pharmacy.id,
        weekNumber: data.weekNumber,
        weekDay: data.weekDay,
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
        ],
      },
    });

    if (existingChamber) {
      return NextResponse.json(
        { error: "Chamber timing conflicts with existing schedule" },
        { status: 400 }
      );
    }

    const chamber = await prisma.chamber.create({
      data: {
        doctorId: data.doctorId,
        pharmacyId: pharmacy.id,
        weekNumber: data.weekNumber,
        weekDay: data.weekDay,
        startTime: data.startTime,
        endTime: data.endTime,
        fees: data.fees,
      },
    });

    return NextResponse.json(chamber);
  } catch (error) {
    console.error("Error creating chamber:", error);
    return NextResponse.json(
      { error: "Failed to create chamber" },
      { status: 500 }
    );
  }
}
