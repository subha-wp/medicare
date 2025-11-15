// @ts-nocheck
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get all active banners (filtered by role if provided)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get("role") as "PATIENT" | "DOCTOR" | "PHARMACY" | null;

    const where: any = {
      isActive: true, // Only return active banners
    };

    // Filter by target audience if role is provided
    const audienceFilter = userRole
      ? [
          { targetAudience: "ALL" },
          { targetAudience: userRole },
        ]
      : undefined;

    // Filter by date range
    const now = new Date();
    const dateFilter = {
      AND: [
        {
          OR: [
            { startDate: null },
            { startDate: { lte: now } },
          ],
        },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    };

    // Combine filters
    if (audienceFilter) {
      where.AND = [
        { OR: audienceFilter },
        dateFilter,
      ];
    } else {
      where.AND = [dateFilter];
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

