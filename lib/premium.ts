import prisma from "./db";

/**
 * Check if a patient has active premium membership
 */
export async function isPremiumMember(patientId: string): Promise<boolean> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { premiumMembership: true },
    });

    if (!patient?.premiumMembership) {
      return false;
    }

    const membership = patient.premiumMembership;
    const isActive =
      membership.status === "ACTIVE" &&
      new Date(membership.endDate) > new Date();

    return isActive;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}

/**
 * Get premium discount for consultation fees (10% for premium members)
 */
export function getPremiumDiscount(isPremium: boolean): number {
  return isPremium ? 0.1 : 0; // 10% discount
}

/**
 * Calculate final amount after premium discount
 */
export function calculateFinalAmount(amount: number, isPremium: boolean): number {
  const discount = getPremiumDiscount(isPremium);
  return amount * (1 - discount);
}

