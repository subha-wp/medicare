import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ChamberList } from "@/components/chambers/chamber-list";

interface SearchParams {
  doctorId?: string;
  doctorName?: string;
}

export default async function ChambersListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { doctorId, doctorName } = await searchParams;
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  let chambers;

  try {
    if (doctorId) {
      // Fetch chambers for a specific doctor
      chambers = await prisma.chamber.findMany({
        where: {
          doctorId: doctorId,
          isActive: true,
        },
        include: {
          doctor: {
            select: {
              id: true,
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
    } else if (user.role === "PHARMACY") {
      // Fetch chambers for pharmacy owner
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { userId: user.id },
      });

      if (!pharmacy) {
        throw new Error("Pharmacy not found");
      }

      chambers = await prisma.chamber.findMany({
        where: {
          pharmacyId: pharmacy.id,
          isActive: true,
        },
        include: {
          doctor: {
            select: {
              id: true,
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
      // Fetch all active chambers for patients
      chambers = await prisma.chamber.findMany({
        where: {
          isActive: true,
        },
        include: {
          doctor: {
            select: {
              id: true,
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
        <h2 className="text-2xl font-bold tracking-tight">
          Available Chambers
        </h2>
        <ChamberList
          chambers={chambers}
          userRole={user.role}
          doctorName={doctorName}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching chambers:", error);
    return (
      <div className="text-center py-8 text-muted-foreground">
        An error occurred while fetching chambers.
      </div>
    );
  }
}
