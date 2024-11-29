import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();

  if (!user || user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
            avatarUrl: true,
          },
        },
        chamber: {
          select: {
            startTime: true,
            endTime: true,
            pharmacy: {
              select: {
                businessName: true,
                address: true,
              },
            },
          },
        },
        medicalRecord: {
          select: {
            diagnosis: true,
            prescription: true,
            notes: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
