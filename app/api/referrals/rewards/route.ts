// @ts-nocheck
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {
      referrerId: user.id,
    };

    if (status) {
      where.status = status;
    }

    const rewards = await prisma.referralReward.findMany({
      where,
      include: {
        referredPatient: {
          include: { user: true },
        },
        transaction: true,
        referralCode: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const totalEarnings = rewards
      .filter((r) => r.status === "PAID" || r.status === "APPROVED")
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    const pendingEarnings = rewards
      .filter((r) => r.status === "PENDING")
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    return NextResponse.json({
      success: true,
      rewards: rewards.map((r) => ({
        id: r.id,
        referredName: r.referredPatient?.name || "Unknown",
        rewardAmount: r.rewardAmount,
        rewardType: r.rewardType,
        status: r.status,
        createdAt: r.createdAt,
        transaction: r.transaction
          ? {
              id: r.transaction.id,
              status: r.transaction.status,
              amount: r.transaction.amount,
            }
          : null,
      })),
      summary: {
        totalEarnings,
        pendingEarnings,
        totalRewards: rewards.length,
      },
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}


