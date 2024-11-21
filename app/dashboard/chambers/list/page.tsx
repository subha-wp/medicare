// app/dashboard/chambers/list/page.tsx
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ChamberList } from "@/components/chambers/chamber-list";

export default async function ChambersListPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  const chambers = await prisma.chamber.findMany({
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Available Chambers</h2>
      <ChamberList chambers={chambers} userRole={user.role} />
    </div>
  );
}
