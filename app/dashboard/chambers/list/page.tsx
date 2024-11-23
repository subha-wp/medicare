import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ChamberList } from "@/components/chambers/chamber-list";
import { AppointmentBookingForm } from "@/components/appointments/appointment-booking-form";

export default async function ChambersListPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  let chambers;

  if (user.role === "PHARMACY") {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { userId: user.id },
    });

    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    chambers = await prisma.chamber.findMany({
      where: {
        isActive: true, // Only fetch active chambers for pharmacy owners
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
            qualification: true,
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
      orderBy: [
        {
          weekDay: "asc",
        },
      ],
    });
  } else {
    // For non-pharmacy users, fetch all active chambers
    chambers = await prisma.chamber.findMany({
      where: {
        isActive: true,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
            qualification: true,
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
      orderBy: [
        {
          pharmacy: {
            name: "asc",
          },
        },
        {
          weekDay: "asc",
        },
      ],
    });
  }

  return (
    <div className="space-y-4 mb-20">
      <h2 className="text-2xl font-bold tracking-tight">Available Chambers</h2>
      <ChamberList chambers={chambers} userRole={user.role} />
    </div>
  );
}
