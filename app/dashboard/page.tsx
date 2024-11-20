// @ts-nocheck
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Stethoscope, Building2 } from "lucide-react";

export default async function DashboardPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  let stats;

  switch (user.role) {
    case "PATIENT":
      stats = await getPatientStats(user.id);
      break;
    case "DOCTOR":
      stats = await getDoctorStats(user.id);
      break;
    case "PHARMACY":
      stats = await getPharmacyStats(user.id);
      break;
    default:
      stats = [];
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function getPatientStats(userId: string) {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    include: {
      appointments: true,
      medicalRecords: true,
    },
  });

  if (!patient) return [];

  return [
    {
      title: "Total Appointments",
      value: patient.appointments.length,
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
      description: "Your total appointments",
    },
    {
      title: "Upcoming Appointments",
      value: patient.appointments.filter((a) => new Date(a.date) > new Date())
        .length,
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
      description: "Your upcoming appointments",
    },
    {
      title: "Medical Records",
      value: patient.medicalRecords.length,
      icon: <Stethoscope className="h-4 w-4 text-muted-foreground" />,
      description: "Your total medical records",
    },
  ];
}

async function getDoctorStats(userId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    include: {
      appointments: true,
      chambers: true,
    },
  });

  if (!doctor) return [];

  return [
    {
      title: "Total Appointments",
      value: doctor.appointments.length,
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
      description: "Your total appointments",
    },
    {
      title: "Upcoming Appointments",
      value: doctor.appointments.filter((a) => new Date(a.date) > new Date())
        .length,
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
      description: "Your upcoming appointments",
    },
    {
      title: "Active Chambers",
      value: doctor.chambers.filter((c) => c.isActive).length,
      icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
      description: "Your active chambers",
    },
    {
      title: "Total Patients",
      value: new Set(doctor.appointments.map((a) => a.patientId)).size,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Your total unique patients",
    },
  ];
}

async function getPharmacyStats(userId: string) {
  const pharmacy = await prisma.pharmacy.findUnique({
    where: { userId },
    include: {
      chambers: {
        include: {
          appointments: true,
        },
      },
    },
  });

  if (!pharmacy) return [];

  const totalAppointments = pharmacy.chambers.reduce(
    (sum, chamber) => sum + chamber.appointments.length,
    0
  );
  const upcomingAppointments = pharmacy.chambers.reduce(
    (sum, chamber) =>
      sum +
      chamber.appointments.filter((a) => new Date(a.date) > new Date()).length,
    0
  );

  return [
    {
      title: "Total Appointments",
      value: totalAppointments,
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
      description: "Total appointments in your chambers",
    },
    {
      title: "Upcoming Appointments",
      value: upcomingAppointments,
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
      description: "Upcoming appointments in your chambers",
    },
    {
      title: "Active Chambers",
      value: pharmacy.chambers.filter((c) => c.isActive).length,
      icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
      description: "Your active chambers",
    },
    {
      title: "Total Doctors",
      value: new Set(pharmacy.chambers.map((c) => c.doctorId)).size,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "Total unique doctors in your chambers",
    },
  ];
}
