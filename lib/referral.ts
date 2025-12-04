// @ts-nocheck
import { prisma } from "./db";
import { UserRole } from "@prisma/client";

/**
 * Generate a unique referral code (6-8 characters)
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get or create referral code for a user
 */
export async function getOrCreateReferralCode(
  userId: string,
  userRole: UserRole
): Promise<string> {
  // Check if user already has a referral code
  const existing = await prisma.referralCode.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing.code;
  }

  // Generate unique code
  let code: string;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    code = generateReferralCode();
    const exists = await prisma.referralCode.findUnique({
      where: { code },
    });
    if (!exists) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error("Failed to generate unique referral code");
  }

  // Create referral code
  await prisma.referralCode.create({
    data: {
      code: code!,
      userId,
      userRole,
      isActive: true,
    },
  });

  return code!;
}

/**
 * Get reward amount based on referral type
 */
export function getReferralRewardAmount(
  referrerType: UserRole,
  referredType: UserRole,
  isFirstReferral: boolean = false
): number {
  // First 3 referrals get 2x rewards
  if (isFirstReferral) {
    if (referrerType === "PATIENT" && referredType === "PATIENT") {
      return 100; // 2x ₹50
    }
    if (referrerType === "DOCTOR" && referredType === "PATIENT") {
      return 50; // 2x ₹25
    }
    if (referrerType === "PHARMACY" && referredType === "DOCTOR") {
      return 200; // 2x ₹100
    }
  }

  // Standard rewards
  if (referrerType === "PATIENT" && referredType === "PATIENT") {
    return 50; // Patient refers patient → ₹50
  }
  if (referrerType === "DOCTOR" && referredType === "PATIENT") {
    return 25; // Doctor refers patient → ₹25 per appointment
  }
  if (referrerType === "PHARMACY" && referredType === "DOCTOR") {
    return 100; // Pharmacy refers doctor → ₹100 per doctor
  }

  return 0;
}

/**
 * Get referral reward type enum
 */
export function getReferralRewardType(
  referrerType: UserRole,
  referredType: UserRole
): "PATIENT_REFERS_PATIENT" | "DOCTOR_REFERS_PATIENT" | "PHARMACY_REFERS_DOCTOR" {
  if (referrerType === "PATIENT" && referredType === "PATIENT") {
    return "PATIENT_REFERS_PATIENT";
  }
  if (referrerType === "DOCTOR" && referredType === "PATIENT") {
    return "DOCTOR_REFERS_PATIENT";
  }
  if (referrerType === "PHARMACY" && referredType === "DOCTOR") {
    return "PHARMACY_REFERS_DOCTOR";
  }
  throw new Error("Invalid referral combination");
}

/**
 * Process referral reward when appointment is completed
 */
export async function processAppointmentReferral(
  appointmentId: string,
  patientId: string,
  doctorId: string
): Promise<void> {
  try {
    // Get appointment with referral code
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: { user: true },
        },
        doctor: {
          include: { user: true },
        },
      },
    });

    if (!appointment?.referralCodeUsed) {
      return; // No referral code used
    }

    // Find referral code
    const referralCode = await prisma.referralCode.findUnique({
      where: { code: appointment.referralCodeUsed },
    });

    // Get referrer user info
    const referrerUser = await prisma.user.findUnique({
      where: { id: referralCode.userId },
    });

    if (!referralCode) {
      return;
    }

    const referrerType = referralCode.userRole;
    const referredType = appointment.patient.user.role;

    if (!referrerUser) {
      return; // Referrer user not found
    }

    // Check if this is first referral for the referrer
    const referralCount = await prisma.referralReward.count({
      where: {
        referrerId: referralCode.userId,
        status: { in: ["APPROVED", "PAID"] },
      },
    });
    const isFirstReferral = referralCount < 3;

    // Only process if appointment is completed and paid
    if (
      appointment.status === "COMPLETED" &&
      appointment.paymentStatus === "PAID"
    ) {
      // Check if reward already exists for this appointment
      const existingReward = await prisma.referralReward.findFirst({
        where: {
          appointmentId,
          referralCodeId: referralCode.id,
        },
      });

      if (existingReward) {
        return; // Already processed
      }

      const rewardAmount = getReferralRewardAmount(
        referrerType,
        referredType,
        isFirstReferral
      );

      if (rewardAmount > 0) {
        // Create reward for referrer
        const reward = await prisma.referralReward.create({
          data: {
            referrerId: referralCode.userId,
            referrerType,
            referredId: appointment.patientId,
            referredType,
            rewardType: getReferralRewardType(referrerType, referredType),
            rewardAmount,
            status: "APPROVED",
            appointmentId,
            referralCodeId: referralCode.id,
          },
        });

        // Update referral code stats
        await prisma.referralCode.update({
          where: { id: referralCode.id },
          data: {
            usedCount: { increment: 1 },
            totalEarnings: { increment: rewardAmount },
          },
        });

        // Create transaction record
        await prisma.rewardTransaction.create({
          data: {
            rewardId: reward.id,
            amount: rewardAmount,
            transactionType: "CREDIT",
            status: "COMPLETED",
            notes: `Referral reward for appointment ${appointmentId}`,
          },
        });

        // If patient refers patient, also give reward to referred patient (the one who was referred)
        if (referrerType === "PATIENT" && referredType === "PATIENT") {
          // Find the patient who was referred (the one who used the code)
          const referredPatient = await prisma.patient.findUnique({
            where: { id: appointment.patientId },
          });

          if (referredPatient) {
            const referredReward = await prisma.referralReward.create({
              data: {
                referrerId: appointment.patientId, // The referred patient gets reward too
                referrerType: "PATIENT",
                referredId: appointment.patientId,
                referredType: "PATIENT",
                rewardType: "PATIENT_REFERS_PATIENT",
                rewardAmount,
                status: "APPROVED",
                appointmentId,
                referralCodeId: referralCode.id,
              },
            });

            await prisma.rewardTransaction.create({
              data: {
                rewardId: referredReward.id,
                amount: rewardAmount,
                transactionType: "CREDIT",
                status: "COMPLETED",
                notes: `Referral reward for being referred`,
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing referral reward:", error);
    // Don't throw - referral processing shouldn't break appointment flow
  }
}

/**
 * Validate and apply referral code during registration
 */
export async function applyReferralCode(
  code: string,
  newUserId: string,
  newUserRole: UserRole
): Promise<{ success: boolean; message?: string; referrerId?: string }> {
  try {
    const referralCode = await prisma.referralCode.findUnique({
      where: { code },
      include: {
        patient: true,
        doctor: true,
        pharmacy: true,
      },
    });

    if (!referralCode || !referralCode.isActive) {
      return { success: false, message: "Invalid referral code" };
    }

    // Can't refer yourself
    if (referralCode.userId === newUserId) {
      return { success: false, message: "You cannot use your own referral code" };
    }

    // Validate referral combinations
    const referrerType = referralCode.userRole;
    const isValidCombination =
      (referrerType === "PATIENT" && newUserRole === "PATIENT") ||
      (referrerType === "DOCTOR" && newUserRole === "PATIENT") ||
      (referrerType === "PHARMACY" && newUserRole === "DOCTOR");

    if (!isValidCombination) {
      return {
        success: false,
        message: "Invalid referral code for this user type",
      };
    }

    return {
      success: true,
      referrerId: referralCode.userId,
    };
  } catch (error) {
    console.error("Error applying referral code:", error);
    return { success: false, message: "Error validating referral code" };
  }
}

