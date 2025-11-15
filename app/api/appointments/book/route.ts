// @ts-nocheck
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { isPremiumMember, calculateFinalAmount } from "@/lib/premium";

const appointmentSchema = z.object({
  chamberId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  slotNumber: z.number().int().positive(),
  paymentMethod: z.enum(["ONLINE", "CASH"]),
});

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = appointmentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.issues },
      { status: 400 }
    );
  }

  const { chamberId, date, slotNumber, paymentMethod } = result.data;

  try {
    // Check if the chamber exists and is active
    const chamber = await prisma.chamber.findUnique({
      where: { id: chamberId, isActive: true, isVerified: true },
      include: { doctor: true, pharmacy: true },
    });

    if (!chamber) {
      return NextResponse.json(
        { error: "Chamber not found, inactive, or not verified" },
        { status: 404 }
      );
    }

    // Check if the appointment date matches the chamber's weekDay and weekNumber
    const appointmentDate = new Date(date);
    const weekDay = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ][appointmentDate.getDay()];
    const weekNumber = getWeekNumber(appointmentDate);

    if (weekDay !== chamber.weekDay || weekNumber !== chamber.weekNumber) {
      return NextResponse.json(
        { error: "The selected date doesn't match the chamber's schedule" },
        { status: 400 }
      );
    }

    // Check if the slot is available
    const existingAppointments = await prisma.appointment.count({
      where: {
        chamberId: chamber.id,
        date: appointmentDate,
        slotNumber: slotNumber,
      },
    });

    if (existingAppointments >= chamber.maxSlots) {
      return NextResponse.json(
        { error: "The selected slot is no longer available" },
        { status: 400 }
      );
    }

    // Check premium status and calculate final amount
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const premium = await isPremiumMember(patient.id);
    const finalAmount = calculateFinalAmount(chamber.fees, premium);

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: chamber.doctorId,
        pharmacyId: chamber.pharmacyId,
        chamberId: chamber.id,
        date: appointmentDate,
        slotNumber: slotNumber,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod,
        amount: finalAmount,
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

function getWeekNumber(
  date: Date
): "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "LAST" {
  const dayOfMonth = date.getDate();
  if (dayOfMonth <= 7) return "FIRST";
  if (dayOfMonth <= 14) return "SECOND";
  if (dayOfMonth <= 21) return "THIRD";
  if (dayOfMonth <= 28) return "FOURTH";
  return "LAST";
}
