// app/api/appointments/route.ts
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { user } = await validateRequest();

  if (!user || user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const patient = await prisma.patient.findFirst({
      where: { userId: user.id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const chamber = await prisma.chamber.findUnique({
      where: { id: data.chamberId },
      include: {
        doctor: true,
        pharmacy: true,
      },
    });

    if (!chamber) {
      return NextResponse.json({ error: "Chamber not found" }, { status: 404 });
    }

    // Check if the appointment slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        chamberId: data.chamberId,
        date: data.date,
        NOT: {
          status: "CANCELLED",
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: chamber.doctorId,
        pharmacyId: chamber.pharmacyId,
        chamberId: chamber.id,
        date: data.date,
        paymentMethod: data.paymentMethod,
        amount: chamber.fees,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
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
    let appointments;
    switch (user.role) {
      case "PATIENT":
        const patient = await prisma.patient.findFirst({
          where: { userId: user.id },
        });
        appointments = await prisma.appointment.findMany({
          where: { patientId: patient?.id },
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
            chamber: true,
            medicalRecord: true,
          },
          orderBy: { date: "desc" },
        });
        break;

      case "DOCTOR":
        const doctor = await prisma.doctor.findFirst({
          where: { userId: user.id },
        });
        appointments = await prisma.appointment.findMany({
          where: { doctorId: doctor?.id },
          include: {
            patient: {
              select: {
                name: true,
                phone: true,
                bloodGroup: true,
              },
            },
            pharmacy: {
              select: {
                name: true,
                address: true,
              },
            },
            chamber: true,
            medicalRecord: true,
          },
          orderBy: { date: "desc" },
        });
        break;

      case "PHARMACY":
        const pharmacy = await prisma.pharmacy.findFirst({
          where: { userId: user.id },
        });
        appointments = await prisma.appointment.findMany({
          where: { pharmacyId: pharmacy?.id },
          include: {
            patient: {
              select: {
                name: true,
                phone: true,
              },
            },
            doctor: {
              select: {
                name: true,
                specialization: true,
              },
            },
            chamber: true,
          },
          orderBy: { date: "desc" },
        });
        break;
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
