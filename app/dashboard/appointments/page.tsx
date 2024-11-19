import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AppointmentsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  const appointments = await getAppointments(user.id, user.role);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Appointments</h2>
        {user.role === "PATIENT" && (
          <Link href="/dashboard/appointments/book">
            <Button>Book Appointment</Button>
          </Link>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{format(new Date(appointment.date), "PPP")}</TableCell>
              <TableCell>{appointment.doctor.name}</TableCell>
              <TableCell>{appointment.patient.name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    appointment.status === "COMPLETED"
                      ? "default"
                      : appointment.status === "CONFIRMED"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {appointment.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {appointment.paymentStatus} - {appointment.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell>₹{appointment.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

async function getAppointments(userId: string, role: string) {
  const where = {
    ...(role === "PATIENT" && {
      patient: {
        userId,
      },
    }),
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

  return prisma.appointment.findMany({
    where,
    include: {
      patient: {
        select: {
          name: true,
        },
      },
      doctor: {
        select: {
          name: true,
        },
      },
      pharmacy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
}
