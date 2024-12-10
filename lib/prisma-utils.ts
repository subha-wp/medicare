//@ts-nocheck
import { Prisma } from "@prisma/client";

export const distanceCalculation = (
  lat1: number,
  lon1: number,
  lat2: Prisma.SqlFragment,
  lon2: Prisma.SqlFragment
) => {
  const earthRadiusKm = 6371;

  return Prisma.sql`
    ${earthRadiusKm} * acos(
      cos(radians(${lat1})) * cos(radians(${lat2})) *
      cos(radians(${lon2}) - radians(${lon1})) +
      sin(radians(${lat1})) * sin(radians(${lat2}))
    )
  `;
};
