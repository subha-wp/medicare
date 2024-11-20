// app/dashboard/chambers/page.tsx
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ChambersPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  const chambers = await getChambers(user.id, user.role);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Chambers</h2>
        {user.role === "PHARMACY" && (
          <Link href="/dashboard/chambers/new">
            <Button>Add New Chamber</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chambers.map((chamber) => (
          <Card key={chamber.id}>
            <CardHeader>
              <CardTitle>
                {chamber.pharmacy.businessName}{" "}
                <span>({chamber.pharmacy.address})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{chamber.doctor.name}</p>
                  <Badge variant="outline" className="w-fit">
                    {chamber.doctor.specialization}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {chamber.weekNumber} {chamber.weekDay}
                </p>
                <p className="text-sm">
                  {chamber.startTime} - {chamber.endTime}
                </p>
                <p className="text-sm font-medium">Fees: ₹{chamber.fees}</p>
                <Badge
                  variant={chamber.isActive ? "default" : "destructive"}
                  className="mt-2"
                >
                  {chamber.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function getChambers(userId: string, role: string) {
  const where = {
    ...(role === "DOCTOR" && {
      doctor: {
        userId,
      },
    }),
    ...(role === "PHARMACY" && {
      pharmacy: {
        userId,
      },
    }),
  };

  return prisma.chamber.findMany({
    where,
    include: {
      doctor: {
        select: {
          name: true,
          specialization: true,
        },
      },
      pharmacy: {
        select: {
          name: true,
          address: true,
          businessName: true,
        },
      },
    },
  });
}
