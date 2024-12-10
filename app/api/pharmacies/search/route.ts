//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
// import { distanceCalculation } from "@/lib/distance";

const ITEMS_PER_PAGE = 9;

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const cursor = searchParams.get("cursor");
    const lat = searchParams.get("lat")
      ? parseFloat(searchParams.get("lat")!)
      : null;
    const lon = searchParams.get("lon")
      ? parseFloat(searchParams.get("lon")!)
      : null;

    let pharmacies;

    if (lat && lon) {
      // Using raw query with proper distance calculation
      pharmacies = await prisma.$queryRaw`
        SELECT 
          p.*,
          ${Prisma.sql`
            6371 * acos(
              cos(radians(${lat})) * cos(radians(CAST(p.location->>'latitude' AS FLOAT))) *
              cos(radians(CAST(p.location->>'longitude' AS FLOAT)) - radians(${lon})) +
              sin(radians(${lat})) * sin(radians(CAST(p.location->>'latitude' AS FLOAT)))
            )
          `} as distance
        FROM "Pharmacy" p
        WHERE 
          p.name ILIKE ${`%${query}%`} OR
          p."businessName" ILIKE ${`%${query}%`} OR
          p.address ILIKE ${`%${query}%`}
        ORDER BY distance ASC
        LIMIT ${ITEMS_PER_PAGE + 1}
        ${cursor ? Prisma.sql`OFFSET ${parseInt(cursor)}` : Prisma.sql``}
      `;
    } else {
      // Without location, just search by text
      pharmacies = await prisma.pharmacy.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { businessName: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
          ],
        },
        take: ITEMS_PER_PAGE + 1,
        ...(cursor && { skip: parseInt(cursor) }),
        orderBy: {
          name: "asc",
        },
      });
    }

    let nextCursor: string | undefined = undefined;
    if (pharmacies.length > ITEMS_PER_PAGE) {
      pharmacies.pop();
      nextCursor = cursor
        ? (parseInt(cursor) + ITEMS_PER_PAGE).toString()
        : ITEMS_PER_PAGE.toString();
    }

    return NextResponse.json({
      pharmacies,
      nextCursor,
      hasMore: pharmacies.length === ITEMS_PER_PAGE,
    });
  } catch (error) {
    console.error("Error searching pharmacies:", error);
    return NextResponse.json(
      { error: "Failed to search pharmacies" },
      { status: 500 }
    );
  }
}
