//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ITEMS_PER_PAGE = 5;

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const lat = searchParams.get("lat")
      ? parseFloat(searchParams.get("lat")!)
      : null;
    const lon = searchParams.get("lon")
      ? parseFloat(searchParams.get("lon")!)
      : null;

    let pharmacies;
    let total;

    if (lat && lon) {
      // Using raw query with proper distance calculation
      const result = await prisma.$queryRaw`
        WITH PharmaciesWithDistance AS (
          SELECT 
            p.*,
            ${Prisma.sql`
              6371 * acos(
                cos(radians(${lat}::float)) * cos(radians(CAST(p.location->>'latitude' AS FLOAT))) *
                cos(radians(CAST(p.location->>'longitude' AS FLOAT)) - radians(${lon}::float)) +
                sin(radians(${lat}::float)) * sin(radians(CAST(p.location->>'latitude' AS FLOAT)))
              )
            `} as distance
          FROM "Pharmacy" p
          WHERE 
            p.name ILIKE ${`%${query}%`}::text OR
            p."businessName" ILIKE ${`%${query}%`}::text OR
            p.address ILIKE ${`%${query}%`}::text
          ORDER BY distance ASC
          LIMIT ${ITEMS_PER_PAGE}::int
          OFFSET ${skip}::int
        )
        SELECT * FROM PharmaciesWithDistance;
      `;

      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) as total
        FROM "Pharmacy" p
        WHERE 
          p.name ILIKE ${`%${query}%`}::text OR
          p."businessName" ILIKE ${`%${query}%`}::text OR
          p.address ILIKE ${`%${query}%`}::text
      `;

      pharmacies = result;
      total = parseInt(countResult[0].total);
    } else {
      [pharmacies, total] = await Promise.all([
        prisma.pharmacy.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { businessName: { contains: query, mode: "insensitive" } },
              { address: { contains: query, mode: "insensitive" } },
            ],
          },
          take: ITEMS_PER_PAGE,
          skip,
          orderBy: {
            name: "asc",
          },
        }),
        prisma.pharmacy.count({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { businessName: { contains: query, mode: "insensitive" } },
              { address: { contains: query, mode: "insensitive" } },
            ],
          },
        }),
      ]);
    }

    const hasMore = skip + pharmacies.length < total;
    const nextPage = hasMore ? page + 1 : null;

    return NextResponse.json({
      pharmacies,
      hasMore,
      nextPage,
      total,
    });
  } catch (error) {
    console.error("Error searching pharmacies:", error);
    return NextResponse.json(
      { error: "Failed to search pharmacies" },
      { status: 500 }
    );
  }
}
