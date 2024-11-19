//app/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Calendar, Stethoscope, Store, User } from "lucide-react";

export default async function DashboardPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  const stats = await getStats(user.id, user.role);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Doctors
            </CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.doctors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Chambers
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.chambers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patients}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function getStats(userId: string, role: string) {
  const baseStats = {
    appointments: 0,
    doctors: await prisma.doctor.count(),
    chambers: await prisma.chamber.count(),
    patients: await prisma.patient.count(),
  };

  switch (role) {
    case "PATIENT":
      return {
        ...baseStats,
        appointments: await prisma.appointment.count({
          where: {
            patient: {
              userId,
            },
          },
        }),
      };
    case "DOCTOR":
      return {
        ...baseStats,
        appointments: await prisma.appointment.count({
          where: {
            doctor: {
              userId,
            },
          },
        }),
      };
    case "PHARMACY":
      return {
        ...baseStats,
        appointments: await prisma.appointment.count({
          where: {
            pharmacy: {
              userId,
            },
          },
        }),
      };
    default:
      return baseStats;
  }
}
