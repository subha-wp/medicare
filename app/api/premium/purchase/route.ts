import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const purchaseSchema = z.object({
  planType: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "LIFETIME"]),
  paymentMethod: z.enum(["ONLINE", "CASH"]),
  autoRenew: z.boolean().default(true),
});

const PLAN_PRICES = {
  MONTHLY: 299,
  QUARTERLY: 799,
  YEARLY: 2499,
  LIFETIME: 9999,
};

const PLAN_DURATIONS = {
  MONTHLY: 30, // days
  QUARTERLY: 90,
  YEARLY: 365,
  LIFETIME: 365 * 100, // 100 years
};

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PATIENT") {
    return NextResponse.json(
      { error: "Only patients can purchase premium membership" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const result = purchaseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { planType, paymentMethod, autoRenew } = result.data;

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

    // Check if user already has an active membership
    const existingMembership = patient.premiumMembership;
    if (
      existingMembership &&
      existingMembership.status === "ACTIVE" &&
      new Date(existingMembership.endDate) > new Date()
    ) {
      return NextResponse.json(
        {
          error: "You already have an active premium membership",
          existingMembership: {
            endDate: existingMembership.endDate,
            planType: existingMembership.planType,
          },
        },
        { status: 400 }
      );
    }

    const amount = PLAN_PRICES[planType];
    const durationDays = PLAN_DURATIONS[planType];

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    if (planType === "LIFETIME") {
      endDate.setFullYear(endDate.getFullYear() + 100);
    } else {
      endDate.setDate(endDate.getDate() + durationDays);
    }

    // Create membership and payment
    const membership = await prisma.premiumMembership.upsert({
      where: { patientId: patient.id },
      create: {
        patientId: patient.id,
        planType,
        status: paymentMethod === "ONLINE" ? "PENDING" : "ACTIVE",
        startDate,
        endDate,
        autoRenew,
      },
      update: {
        planType,
        status: paymentMethod === "ONLINE" ? "PENDING" : "ACTIVE",
        startDate,
        endDate,
        autoRenew,
        cancelledAt: null,
        cancellationReason: null,
      },
    });

    const payment = await prisma.premiumPayment.create({
      data: {
        membershipId: membership.id,
        amount,
        paymentMethod,
        paymentStatus: paymentMethod === "ONLINE" ? "PENDING" : "PAID",
        paidAt: paymentMethod === "CASH" ? new Date() : null,
      },
    });

    // TODO: Integrate with payment gateway for ONLINE payments
    // For now, if payment is CASH, we activate immediately
    // If ONLINE, it should go through payment gateway first

    return NextResponse.json({
      success: true,
      membership: {
        id: membership.id,
        planType: membership.planType,
        status: membership.status,
        startDate: membership.startDate,
        endDate: membership.endDate,
      },
      payment: {
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
      },
      message:
        paymentMethod === "CASH"
          ? "Premium membership activated successfully!"
          : "Payment initiated. Your membership will be activated after payment confirmation.",
    });
  } catch (error) {
    console.error("Error purchasing premium membership:", error);
    return NextResponse.json(
      { error: "Failed to purchase premium membership" },
      { status: 500 }
    );
  }
}

