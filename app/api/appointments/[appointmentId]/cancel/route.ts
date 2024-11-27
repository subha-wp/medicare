import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.appointmentId },
      include: { patient: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify that the appointment belongs to the user
    if (appointment.patient.userId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to cancel this appointment" },
        { status: 403 }
      );
    }

    // Only allow cancellation of pending appointments
    if (appointment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only cancel pending appointments" },
        { status: 400 }
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.appointmentId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}
