import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PATIENT") {
    return NextResponse.json(
      { error: "Only patients can have premium membership" },
      { status: 403 }
    );
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
      include: {
        premiumMembership: {
          include: {
            payments: {
              orderBy: { createdAt: "desc" },
              take: 5,
            },
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const membership = patient.premiumMembership;
    const isPremium = membership && membership.status === "ACTIVE" && new Date(membership.endDate) > new Date();

    return NextResponse.json({
      isPremium,
      membership: membership
        ? {
            id: membership.id,
            planType: membership.planType,
            status: membership.status,
            startDate: membership.startDate,
            endDate: membership.endDate,
            autoRenew: membership.autoRenew,
            cancelledAt: membership.cancelledAt,
            cancellationReason: membership.cancellationReason,
          }
        : null,
      recentPayments: membership?.payments || [],
    });
  } catch (error) {
    console.error("Error fetching premium status:", error);
    return NextResponse.json(
      { error: "Failed to fetch premium status" },
      { status: 500 }
    );
  }
}

