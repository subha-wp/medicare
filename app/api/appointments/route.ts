// app/api/appointments/route.ts
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const appointmentSchema = z.object({
  chamberId: z.string().cuid(),
  date: z.string().datetime(),
  slotNumber: z.number().int().positive(),
});

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PATIENT") {
    return NextResponse.json(
      { error: "Only patients can book appointments" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const result = appointmentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.issues },
      { status: 400 }
    );
  }

  const { chamberId, date, slotNumber } = result.data;

  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const chamber = await prisma.chamber.findUnique({
      where: { id: chamberId },
      include: { doctor: true, pharmacy: true },
    });

    if (!chamber) {
      return NextResponse.json({ error: "Chamber not found" }, { status: 404 });
    }

    // Check if the slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        chamberId,
        date,
        slotNumber,
        status: { not: "CANCELLED" },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "This slot is already booked" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: chamber.doctorId,
        pharmacyId: chamber.pharmacyId,
        chamberId,
        date,
        slotNumber,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "ONLINE", // You might want to make this configurable
        amount: chamber.fees,
      },
    });

    return NextResponse.json({ success: true, appointmentId: appointment.id });
  } catch (error) {
    console.error("Appointment booking error:", error);
    return NextResponse.json(
      { error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}
