/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Users,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Plus,
} from "lucide-react";
import React from "react";
import Link from "next/link";

export default async function DashboardPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  let stats;
  let userName = user.name || "User";

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
    <div className="min-h-screen bg-gray-50">
      {/* Added hero banner section with medical imagery and greeting */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Hello, {userName}!</h1>
              <p className="text-emerald-100 text-sm">
                {user.role === "PATIENT" && "Take care of your health today"}
                {user.role === "DOCTOR" && "Ready to help your patients"}
                {user.role === "PHARMACY" && "Managing healthcare services"}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Added medical banner image */}
          <div className="mt-6 relative h-32 bg-white/10 rounded-2xl backdrop-blur-sm overflow-hidden">
            <img
              src="https://images.pod.co/AknvprdAKX7_ydhDXaMCqBOoFXh0I8LL10oyzOntUHQ/resize:fill:1400:1400/plain/artwork/26765354-aeab-4bc6-a4ce-b3e5c5d00036/my-diet-counsellor/how-to-stay-healthy-5-tips-to-stay-healthy.jpg"
              alt="Medical Banner"
              className="w-full h-full  object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/40 to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        {/* Added quick appointment booking section */}
        <Card className="mb-6 border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-500">
                    Book appointments & more
                  </p>
                </div>
              </div>
            </div>

            <div className="">
              <Link href="/dashboard/appointments">
                <Button
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-12 rounded-xl"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  My Bookings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced stats section with better mobile layout */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Your Overview
          </h2>
          <div className="grid gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        {React.cloneElement(stat.icon, {
                          className: "w-5 h-5 text-emerald-600",
                        })}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Added quick access section */}
        <Card className="border-0 shadow-sm bg-white mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">
              Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="ghost"
                className="h-16 flex-col gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                <Stethoscope className="w-5 h-5" />
                <span className="text-xs">Doctors</span>
              </Button>
              <Button
                variant="ghost"
                className="h-16 flex-col gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs">Chambers</span>
              </Button>
              <Button
                variant="ghost"
                className="h-16 flex-col gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                <MapPin className="w-5 h-5" />
                <span className="text-xs">Pharmacy</span>
              </Button>
            </div>
          </CardContent>
        </Card>
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
