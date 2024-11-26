// @ts-nocheck
// app/dashboard/appointments/page.tsx

import { redirect } from "next/navigation";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { headers } from "next/headers";

export default async function AppointmentsPage() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/appointments`,
    {
      headers: {
        Cookie: (await headers()).get("cookie") || "",
      },
    }
  );

  const appointments = await response.json();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Appointments</h2>
        {user.role === "PATIENT" && (
          <Link href="/dashboard/chambers/list">
            <Button>Book New Appointment</Button>
          </Link>
        )}
      </div>

      <AppointmentList appointments={appointments} userRole={user.role} />
    </div>
  );
}
