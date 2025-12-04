// @ts-nocheck
// app/api/medical-records/route.ts
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { patient: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.doctorId !== doctor.id) {
      return NextResponse.json(
        { error: "Unauthorized to create medical record for this appointment" },
        { status: 403 }
      );
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId: doctor.id,
        diagnosis: data.diagnosis,
        prescription: data.prescription,
        notes: data.notes,
      },
    });

    // Update appointment status to completed
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "COMPLETED", paymentStatus: "PAID" },
    });

    // Process referral rewards if referral code was used
    if (updatedAppointment.referralCodeUsed) {
      const { processAppointmentReferral } = await import("@/lib/referral");
      await processAppointmentReferral(
        updatedAppointment.id,
        updatedAppointment.patientId,
        updatedAppointment.doctorId
      );
    }

    return NextResponse.json(medicalRecord);
  } catch (error) {
    console.error("Error creating medical record:", error);
    return NextResponse.json(
      { error: "Failed to create medical record" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let medicalRecords;
    switch (user.role) {
      case "PATIENT":
        const patient = await prisma.patient.findFirst({
          where: { userId: user.id },
        });
        medicalRecords = await prisma.medicalRecord.findMany({
          where: { patientId: patient?.id },
          include: {
            doctor: {
              select: {
                name: true,
                specialization: true,
              },
            },
            appointment: true,
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "DOCTOR":
        const doctor = await prisma.doctor.findFirst({
          where: { userId: user.id },
        });
        medicalRecords = await prisma.medicalRecord.findMany({
          where: { doctorId: doctor?.id },
          include: {
            patient: {
              select: {
                name: true,
                bloodGroup: true,
              },
            },
            appointment: true,
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Unauthorized to access medical records" },
          { status: 403 }
        );
    }

    return NextResponse.json(medicalRecords);
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
      { status: 500 }
    );
  }
}
