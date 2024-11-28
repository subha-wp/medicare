import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 9;

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const cursor = searchParams.get("cursor") || undefined;

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
        qualification: true,
        experience: true,
        about: true,
      },
      take: ITEMS_PER_PAGE + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: {
        name: "asc",
      },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (doctors.length > ITEMS_PER_PAGE) {
      const nextItem = doctors.pop();
      nextCursor = nextItem?.id;
    }

    return NextResponse.json({
      doctors,
      nextCursor,
      hasMore: doctors.length === ITEMS_PER_PAGE,
    });
  } catch (error) {
    console.error("Error searching doctors:", error);
    return NextResponse.json(
      { error: "Failed to search doctors" },
      { status: 500 }
    );
  }
}
