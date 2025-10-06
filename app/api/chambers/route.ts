// @ts-nocheck
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const weekNumbers = ["FIRST", "SECOND", "THIRD", "FOURTH", "LAST"] as const;
const weekDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const chamberSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  weekNumber: z.enum(weekNumbers, {
    required_error: "Please select a week number",
  }),
  weekDay: z.enum(weekDays, {
    required_error: "Please select a day of the week",
  }),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  fees: z.coerce.number().min(0, "Fees must be a positive number"),
  slotDuration: z.coerce
    .number()
    .min(5, "Slot duration must be at least 5 minutes"),
  maxSlots: z.coerce.number().min(1, "At least one slot is required"),
});

export async function GET(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { userId: user.id },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    const chambers = await prisma.chamber.findMany({
      where: { pharmacyId: pharmacy.id },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
            licenseNo: true,
          },
        },
      },
      orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ chambers });
  } catch (error) {
    console.error("Error fetching chambers:", error);
    return NextResponse.json(
      { error: "Failed to fetch chambers" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { user } = await validateRequest();

  if (!user || user.role !== "PHARMACY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { chamberId, isActive, isVerified, verificationNotes } = body;

  // Only allow pharmacy to update isActive, verification should be handled by admin
  const updateData: any = {};

  if (typeof isActive === "boolean") {
    updateData.isActive = isActive;
  }

  // For now, allow pharmacy to self-verify (in production, this should be admin-only)
  if (typeof isVerified === "boolean") {
    updateData.isVerified = isVerified;
    updateData.verificationDate = isVerified ? new Date() : null;
    if (verificationNotes) {
      updateData.verificationNotes = verificationNotes;
    }
  }

  try {
    const updatedChamber = await prisma.chamber.update({
      where: { id: chamberId },
      data: updateData,
    });

    return NextResponse.json({ success: true, chamber: updatedChamber });
  } catch (error) {
    console.error("Chamber update error:", error);
    return NextResponse.json(
      { error: "Failed to update chamber" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { user } = await validateRequest();
  if (!user || user.role !== "PHARMACY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chamberId = searchParams.get("id");

  if (!chamberId) {
    return NextResponse.json(
      { error: "Chamber ID is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.chamber.delete({
      where: { id: chamberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chamber deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete chamber" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "PHARMACY") {
    return NextResponse.json(
      { error: "Only pharmacy owners can create chambers" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const result = chamberSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.issues },
      { status: 400 }
    );
  }

  const {
    doctorId,
    weekNumber,
    weekDay,
    startTime,
    endTime,
    fees,
    slotDuration,
    maxSlots,
  } = result.data;

  try {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { userId: user.id },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    const chamber = await prisma.chamber.create({
      data: {
        doctorId,
        pharmacyId: pharmacy.id,
        weekNumber,
        weekDay,
        startTime,
        endTime,
        fees,
        slotDuration,
        maxSlots,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
            licenseNo: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, chamberId: chamber.id });
  } catch (error) {
    console.error("Chamber creation error:", error);
    return NextResponse.json(
      { error: "Failed to create chamber" },
      { status: 500 }
    );
  }
}
