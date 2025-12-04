// @ts-nocheck
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { getOrCreateReferralCode } from "@/lib/referral";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const code = await getOrCreateReferralCode(user.id, user.role);

    const referralCode = await prisma.referralCode.findUnique({
      where: { code },
      include: {
        rewards: {
          where: { status: { in: ["APPROVED", "PAID"] } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code not found" },
        { status: 404 }
      );
    }

    // Get pending rewards
    const pendingRewards = await prisma.referralReward.count({
      where: {
        referrerId: user.id,
        status: "PENDING",
      },
    });

    // Get total earnings
    const totalEarnings = referralCode.totalEarnings || 0;

    // Get recent referrals
    const recentReferrals = await prisma.referralReward.findMany({
      where: {
        referrerId: user.id,
      },
      include: {
        referredPatient: {
          include: { user: true },
        },
        transaction: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      stats: {
        code,
        usedCount: referralCode.usedCount,
        totalEarnings,
        pendingRewards,
        recentReferrals: recentReferrals.map((r) => ({
          id: r.id,
          referredName: r.referredPatient?.name || "Unknown",
          rewardAmount: r.rewardAmount,
          status: r.status,
          createdAt: r.createdAt,
        })),
      },
      referralUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?ref=${code}`,
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}


