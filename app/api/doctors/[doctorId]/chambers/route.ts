// app/api/doctors/[doctorId]/chambers/route.ts
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { doctorId: string } }
) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chambers = await prisma.chamber.findMany({
      where: {
        doctorId: params.doctorId,
      },
      include: {
        pharmacy: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: [
        {
          weekDay: "asc",
        },
        {
          startTime: "asc",
        },
      ],
    });

    return NextResponse.json(chambers);
  } catch (error) {
    console.error("Error fetching chambers:", error);
    return NextResponse.json(
      { error: "Failed to fetch chambers" },
      { status: 500 }
    );
  }
}
