import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { specialization: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          specialization: true,
          qualification: true,
          experience: true,
          about: true,
          avatarUrl: true,
          licenseNo: true,
        },
        take: ITEMS_PER_PAGE,
        skip,
        orderBy: {
          name: "asc",
        },
      }),
      prisma.doctor.count({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { specialization: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    const hasMore = skip + doctors.length < total;
    const nextPage = hasMore ? page + 1 : null;

    return NextResponse.json({
      doctors,
      hasMore,
      nextPage,
      total,
    });
  } catch (error) {
    console.error("Error searching doctors:", error);
    return NextResponse.json(
      { error: "Failed to search doctors" },
      { status: 500 }
    );
  }
}
