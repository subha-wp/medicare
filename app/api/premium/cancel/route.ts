import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PATIENT") {
    return NextResponse.json(
      { error: "Only patients can cancel premium membership" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const result = cancelSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { reason } = result.data;

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
      include: { premiumMembership: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const membership = patient.premiumMembership;

    if (!membership) {
      return NextResponse.json(
        { error: "No premium membership found" },
        { status: 404 }
      );
    }

    if (membership.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Membership is already cancelled" },
        { status: 400 }
      );
    }

    // Cancel the membership
    const updatedMembership = await prisma.premiumMembership.update({
      where: { id: membership.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason: reason || null,
        autoRenew: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Premium membership cancelled successfully",
      membership: {
        id: updatedMembership.id,
        status: updatedMembership.status,
        cancelledAt: updatedMembership.cancelledAt,
      },
    });
  } catch (error) {
    console.error("Error cancelling premium membership:", error);
    return NextResponse.json(
      { error: "Failed to cancel premium membership" },
      { status: 500 }
    );
  }
}

