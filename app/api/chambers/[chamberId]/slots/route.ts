import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chamberId: string }> }
) {
  const { chamberId } = await params;

  const { user } = await validateRequest();
  if (!user) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dateStr = request.nextUrl.searchParams.get("date");

  if (!dateStr) {
    console.log("Missing date parameter");
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  try {
    const date = new Date(dateStr);

    // Get the chamber to verify it exists and get maxSlots
    const chamber = await prisma.chamber.findUnique({
      where: { id: chamberId },
    });

    if (!chamber) {
      return NextResponse.json({ error: "Chamber not found" }, { status: 404 });
    }

    // Count booked appointments for the given date
    const bookedSlots = await prisma.appointment.count({
      where: {
        chamberId: chamberId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: {
          not: "CANCELLED",
        },
      },
    });

    return NextResponse.json({
      maxSlots: chamber.maxSlots,
      bookedSlots,
      availableSlots: chamber.maxSlots - bookedSlots,
    });
  } catch (error) {
    console.error("Error fetching slot availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch slot availability" },
      { status: 500 }
    );
  }
}
