//@ts-nocheck
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ChamberList } from "@/components/chambers/chamber-list";

interface SearchParams {
  doctorId?: string;
  doctorName?: string;
  pharmacyId?: string;
  pharmacyName?: string;
}

export default async function ChambersListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { doctorId, doctorName, pharmacyId, pharmacyName } = await searchParams;
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
              avatarUrl: true,
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
    } else if (pharmacyId) {
      // Fetch chambers for a specific pharmacy
      chambers = await prisma.chamber.findMany({
        where: {
          pharmacyId: pharmacyId,
          isActive: true,
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              qualification: true,
              avatarUrl: true,
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
              avatarUrl: true,
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
              avatarUrl: true,
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
        <h2 className="text-xl font-bold tracking-tight">Available Chambers</h2>
        <ChamberList
          chambers={chambers}
          userRole={user.role}
          doctorName={doctorName}
          pharmacyName={pharmacyName}
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
