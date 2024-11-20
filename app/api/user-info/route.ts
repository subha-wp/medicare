import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let userInfo;

    switch (user.role) {
      case "PHARMACY":
        userInfo = await prisma.pharmacy.findUnique({
          where: { userId: user.id },
          select: { businessName: true },
        });
        break;
      case "DOCTOR":
        userInfo = await prisma.doctor.findUnique({
          where: { userId: user.id },
          select: { name: true },
        });
        break;
      case "PATIENT":
        userInfo = await prisma.patient.findUnique({
          where: { userId: user.id },
          select: { name: true },
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 400 }
        );
    }

    if (!userInfo) {
      return NextResponse.json(
        { error: "User info not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 500 }
    );
  }
}
