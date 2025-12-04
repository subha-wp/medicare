// @ts-nocheck
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { getOrCreateReferralCode } from "@/lib/referral";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const code = await getOrCreateReferralCode(user.id, user.role);

    return NextResponse.json({
      success: true,
      code,
      referralUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?ref=${code}`,
    });
  } catch (error) {
    console.error("Error generating referral code:", error);
    return NextResponse.json(
      { error: "Failed to generate referral code" },
      { status: 500 }
    );
  }
}

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
        },
      },
    });

    return NextResponse.json({
      success: true,
      code,
      usedCount: referralCode?.usedCount || 0,
      totalEarnings: referralCode?.totalEarnings || 0,
      referralUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?ref=${code}`,
    });
  } catch (error) {
    console.error("Error fetching referral code:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral code" },
      { status: 500 }
    );
  }
}

