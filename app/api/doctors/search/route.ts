import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const doctors = await prisma.doctor.findMany({
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
      },
      take: 10,
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Error searching doctors:", error);
    return NextResponse.json(
      { error: "Failed to search doctors" },
      { status: 500 }
    );
  }
}
