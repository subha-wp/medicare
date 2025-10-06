import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ITEMS_PER_PAGE = 10;
const MAX_DISTANCE_KM = 90; // Increased for "all" endpoint

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const doctorId = searchParams.get("doctorId");
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
      // Optimized query for location-based search
      const result = await prisma.$queryRaw<any[]>`
        WITH ChambersWithDistance AS (
          SELECT 
            c.id, 
            c."weekNumbers", 
            c."weekDays", 
            c."scheduleType", 
            c."startTime", 
            c."endTime", 
            c.fees, 
            c."maxSlots", 
            c."slotDuration", 
            c."isVerified", 
            c."verificationDate",
            d.id as "doctorId", 
            d.name as "doctorName", 
            d.specialization, 
            d.qualification, 
            d."avatarUrl",
            d."licenseNo",
            p.name as "pharmacyName", 
            p.address, 
            p."businessName", 
            p.location,
            (
              6371 * acos(
                LEAST(1.0,
                  cos(radians(${lat})) * cos(radians(CAST(p.location->>'latitude' AS FLOAT))) *
                  cos(radians(CAST(p.location->>'longitude' AS FLOAT)) - radians(${lon})) +
                  sin(radians(${lat})) * sin(radians(CAST(p.location->>'latitude' AS FLOAT)))
                )
              )
            ) as distance
          FROM "Chamber" c
          JOIN "Doctor" d ON c."doctorId" = d.id
          JOIN "Pharmacy" p ON c."pharmacyId" = p.id
          WHERE 
            c."isActive" = true AND
            p.location IS NOT NULL AND
            p.location->>'latitude' IS NOT NULL AND
            p.location->>'longitude' IS NOT NULL AND
            (
              CASE 
                WHEN ${doctorId} IS NOT NULL THEN d.id = ${doctorId}
                ELSE true
              END
            ) AND
            (
              CASE 
                WHEN ${query} = '' THEN true
                ELSE (
                  d.name ILIKE ${"%" + query + "%"} OR
                  d.specialization ILIKE ${"%" + query + "%"} OR
                  p.name ILIKE ${"%" + query + "%"} OR
                  p.address ILIKE ${"%" + query + "%"}
                )
              END
            )
        ),
        FilteredChambers AS (
          SELECT *
          FROM ChambersWithDistance
          WHERE distance <= ${MAX_DISTANCE_KM}
          ORDER BY "isVerified" DESC, distance ASC
        )
        SELECT 
          id, 
          "weekNumbers", 
          "weekDays", 
          "scheduleType", 
          "startTime", 
          "endTime", 
          fees, 
          "maxSlots", 
          "slotDuration", 
          "isVerified", 
          "verificationDate",
          json_build_object(
            'id', "doctorId",
            'name', "doctorName",
            'specialization', specialization,
            'qualification', qualification,
            'avatarUrl', "avatarUrl",
            'licenseNo', "licenseNo"
          ) as doctor,
          json_build_object(
            'name', "pharmacyName",
            'address', address,
            'businessName', "businessName",
            'location', location
          ) as pharmacy,
          distance
        FROM FilteredChambers
        LIMIT ${ITEMS_PER_PAGE}
        OFFSET ${skip};
      `;

      const countResult = await prisma.$queryRaw<[{ total: bigint }]>`
        SELECT COUNT(*) as total
        FROM "Chamber" c
        JOIN "Doctor" d ON c."doctorId" = d.id
        JOIN "Pharmacy" p ON c."pharmacyId" = p.id
        WHERE 
          c."isActive" = true AND
          p.location IS NOT NULL AND
          p.location->>'latitude' IS NOT NULL AND
          p.location->>'longitude' IS NOT NULL AND
          (
            CASE 
              WHEN ${doctorId} IS NOT NULL THEN d.id = ${doctorId}
              ELSE true
            END
          ) AND
          (
            6371 * acos(
              LEAST(1.0,
                cos(radians(${lat})) * cos(radians(CAST(p.location->>'latitude' AS FLOAT))) *
                cos(radians(CAST(p.location->>'longitude' AS FLOAT)) - radians(${lon})) +
                sin(radians(${lat})) * sin(radians(CAST(p.location->>'latitude' AS FLOAT)))
              )
            )
          ) <= ${MAX_DISTANCE_KM} AND
          (
            CASE 
              WHEN ${query} = '' THEN true
              ELSE (
                d.name ILIKE ${"%" + query + "%"} OR
                d.specialization ILIKE ${"%" + query + "%"} OR
                p.name ILIKE ${"%" + query + "%"} OR
                p.address ILIKE ${"%" + query + "%"}
              )
            END
          )
      `;

      chambers = result || [];
      total = Number(countResult[0]?.total || 0);
    } else {
      // Fallback without location - limit results for performance
      const whereClause = {
        isActive: true,
        ...(doctorId && {
          doctorId: doctorId,
        }),
        ...(query && {
          OR: [
            {
              doctor: {
                name: { contains: query, mode: "insensitive" as const },
              },
            },
            {
              doctor: {
                specialization: {
                  contains: query,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              pharmacy: {
                name: { contains: query, mode: "insensitive" as const },
              },
            },
            {
              pharmacy: {
                address: { contains: query, mode: "insensitive" as const },
              },
            },
          ],
        }),
      };

      [chambers, total] = await Promise.all([
        prisma.chamber.findMany({
          where: whereClause,
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                qualification: true,
                avatarUrl: true,
                licenseNo: true,
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
          orderBy: [{ isVerified: "desc" }, { doctor: { name: "asc" } }],
        }),
        prisma.chamber.count({
          where: whereClause,
        }),
      ]);
    }

    const hasMore = skip + chambers.length < total;
    const nextPage = hasMore ? page + 1 : null;

    return NextResponse.json({
      chambers: chambers.map((chamber) => ({
        ...chamber,
        distance: chamber.distance
          ? parseFloat(Number(chamber.distance).toFixed(2))
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
