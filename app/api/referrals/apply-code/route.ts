// @ts-nocheck
import { NextResponse } from "next/server";
import { z } from "zod";
import { applyReferralCode } from "@/lib/referral";
import prisma from "@/lib/prisma";

const applyCodeSchema = z.object({
  code: z.string().min(6).max(10),
  userId: z.string(),
  userRole: z.enum(["PATIENT", "DOCTOR", "PHARMACY"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = applyCodeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { code, userId, userRole } = result.data;

    const validation = await applyReferralCode(code, userId, userRole);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    // Store referral code in user's profile for later use
    // This will be used when they book their first appointment
    if (userRole === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (patient) {
        // Store in a temporary field or create a pending referral record
        // For now, we'll track it when they book first appointment
      }
    }

    return NextResponse.json({
      success: true,
      message: "Referral code applied successfully",
    });
  } catch (error) {
    console.error("Error applying referral code:", error);
    return NextResponse.json(
      { error: "Failed to apply referral code" },
      { status: 500 }
    );
  }
}


