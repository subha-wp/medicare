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

    let chambers;
    let total;

    if (lat && lon) {
      // Using raw query with proper distance calculation
      const result = await prisma.$queryRaw`
    WITH ChambersWithDistance AS (
      SELECT 
        c.id, c."weekNumber", c."weekDay", c."startTime", c."endTime", c.fees, c."maxSlots",
        d.id as "doctorId", d.name as "doctorName", d.specialization, d.qualification, d."avatarUrl",
        p.name as "pharmacyName", p.address, p."businessName", p.location,
        ${Prisma.sql`
          6371 * acos(
            cos(radians(${lat})) * cos(radians(CAST(p.location->>'latitude' AS FLOAT))) *
            cos(radians(CAST(p.location->>'longitude' AS FLOAT)) - radians(${lon})) +
            sin(radians(${lat})) * sin(radians(CAST(p.location->>'latitude' AS FLOAT)))
          )
        `} as distance
      FROM "Chamber" c
      JOIN "Doctor" d ON c."doctorId" = d.id
      JOIN "Pharmacy" p ON c."pharmacyId" = p.id
      WHERE 
        c."isActive" = true AND
        (d.name ILIKE ${`%${query}%`} OR
        d.specialization ILIKE ${`%${query}%`} OR
        p.name ILIKE ${`%${query}%`} OR
        p.address ILIKE ${`%${query}%`})
    )
    SELECT 
      id, "weekNumber", "weekDay", "startTime", "endTime", fees, "maxSlots",
      json_build_object(
        'id', "doctorId",
        'name', "doctorName",
        'specialization', specialization,
        'qualification', qualification,
        'avatarUrl', "avatarUrl"
      ) as doctor,
      json_build_object(
        'name', "pharmacyName",
        'address', address,
        'businessName', "businessName",
        'location', location
      ) as pharmacy,
      distance
    FROM ChambersWithDistance
    ORDER BY distance ASC
    LIMIT ${ITEMS_PER_PAGE}
    OFFSET ${skip};
  `;

      const countResult = await prisma.$queryRaw`
    SELECT COUNT(*) as total
    FROM "Chamber" c
    JOIN "Doctor" d ON c."doctorId" = d.id
    JOIN "Pharmacy" p ON c."pharmacyId" = p.id
    WHERE 
      c."isActive" = true AND
      (d.name ILIKE ${`%${query}%`} OR
      d.specialization ILIKE ${`%${query}%`} OR
      p.name ILIKE ${`%${query}%`} OR
      p.address ILIKE ${`%${query}%`})
  `;

      chambers = result;
      total = parseInt(countResult[0].total);
    } else {
      [chambers, total] = await Promise.all([
        prisma.chamber.findMany({
          where: {
            isActive: true,
            OR: [
              { doctor: { name: { contains: query, mode: "insensitive" } } },
              {
                doctor: {
                  specialization: { contains: query, mode: "insensitive" },
                },
              },
              { pharmacy: { name: { contains: query, mode: "insensitive" } } },
              {
                pharmacy: { address: { contains: query, mode: "insensitive" } },
              },
            ],
          },
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                qualification: true,
                avatarUrl: true,
              },
            },
            pharmacy: {
              select: {
                name: true,
                address: true,
                location: true,
                businessName: true,
              },
            },
          },
          take: ITEMS_PER_PAGE,
          skip,
          orderBy: {
            doctor: {
              name: "asc",
            },
          },
        }),
        prisma.chamber.count({
          where: {
            isActive: true,
            OR: [
              { doctor: { name: { contains: query, mode: "insensitive" } } },
              {
                doctor: {
                  specialization: { contains: query, mode: "insensitive" },
                },
              },
              { pharmacy: { name: { contains: query, mode: "insensitive" } } },
              {
                pharmacy: { address: { contains: query, mode: "insensitive" } },
              },
            ],
          },
        }),
      ]);
    }

    const hasMore = skip + chambers.length < total;
    const nextPage = hasMore ? page + 1 : null;

    return NextResponse.json({
      chambers: chambers.map((chamber) => ({
        ...chamber,
        distance: chamber.distance
          ? parseFloat(chamber.distance.toFixed(2))
          : null,
      })),
      hasMore,
      nextPage,
      total,
      userRole: user.role,
    });
  } catch (error) {
    console.error("Error searching chambers:", error);
    return NextResponse.json(
      { error: "Failed to search chambers" },
      { status: 500 }
    );
  }
}
