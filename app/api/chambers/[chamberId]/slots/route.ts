import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { chamberId: string } }
) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  try {
    const chamber = await prisma.chamber.findUnique({
      where: { id: params.chamberId },
    });

    if (!chamber) {
      return NextResponse.json({ error: "Chamber not found" }, { status: 404 });
    }

    const appointmentDate = new Date(date);
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        chamberId: chamber.id,
        date: appointmentDate,
      },
      select: {
        slotNumber: true,
      },
    });

    const bookedSlots = new Set(existingAppointments.map((a) => a.slotNumber));

    const [startHour, startMinute] = chamber.startTime.split(":").map(Number);
    const [endHour, endMinute] = chamber.endTime.split(":").map(Number);

    const startTime = new Date(appointmentDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(appointmentDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    const availableSlots = [];
    let currentSlot = 1;
    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      if (availableSlots.length >= chamber.maxSlots) break;

      if (!bookedSlots.has(currentSlot)) {
        const slotEndTime = new Date(
          currentTime.getTime() + chamber.slotDuration * 60000
        );
        availableSlots.push({
          slotNumber: currentSlot,
          startTime: currentTime.toTimeString().slice(0, 5),
          endTime: slotEndTime.toTimeString().slice(0, 5),
        });
      }

      currentSlot++;
      currentTime = new Date(
        currentTime.getTime() + chamber.slotDuration * 60000
      );
    }

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
