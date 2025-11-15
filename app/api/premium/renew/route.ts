import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

const PLAN_PRICES = {
  MONTHLY: 299,
  QUARTERLY: 799,
  YEARLY: 2499,
  LIFETIME: 9999,
};

const PLAN_DURATIONS = {
  MONTHLY: 30,
  QUARTERLY: 90,
  YEARLY: 365,
  LIFETIME: 365 * 100,
};

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PATIENT") {
    return NextResponse.json(
      { error: "Only patients can renew premium membership" },
      { status: 403 }
    );
  }

  try {
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
        { error: "No premium membership found to renew" },
        { status: 404 }
      );
    }

    if (membership.planType === "LIFETIME") {
      return NextResponse.json(
        { error: "Lifetime membership does not need renewal" },
        { status: 400 }
      );
    }

    const amount = PLAN_PRICES[membership.planType];
    const durationDays = PLAN_DURATIONS[membership.planType];

    // Calculate new end date (extend from current end date or now, whichever is later)
    const currentEndDate = new Date(membership.endDate);
    const now = new Date();
    const baseDate = currentEndDate > now ? currentEndDate : now;
    const newEndDate = new Date(baseDate);
    newEndDate.setDate(newEndDate.getDate() + durationDays);

    // Update membership
    const updatedMembership = await prisma.premiumMembership.update({
      where: { id: membership.id },
      data: {
        endDate: newEndDate,
        status: "ACTIVE",
        autoRenew: true,
      },
    });

    // Create renewal payment
    const payment = await prisma.premiumPayment.create({
      data: {
        membershipId: membership.id,
        amount,
        paymentMethod: "ONLINE", // Can be made configurable
        paymentStatus: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Premium membership renewed successfully",
      membership: {
        id: updatedMembership.id,
        planType: updatedMembership.planType,
        endDate: updatedMembership.endDate,
        status: updatedMembership.status,
      },
      payment: {
        id: payment.id,
        amount: payment.amount,
        paymentStatus: payment.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Error renewing premium membership:", error);
    return NextResponse.json(
      { error: "Failed to renew premium membership" },
      { status: 500 }
    );
  }
}

