import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PatientAppointments } from "@/components/appointments/patient-appointments";
import { DoctorAppointments } from "@/components/appointments/doctor-appointments";
import { PharmacyAppointments } from "@/components/appointments/pharmacy-appointments";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AppointmentsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  const renderAppointments = () => {
    switch (user.role) {
      case "PATIENT":
        return <PatientAppointments />;
      case "DOCTOR":
        return <DoctorAppointments />;
      case "PHARMACY":
        return <PharmacyAppointments />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-2">
      <div className="flex justify-between items-center">
        <h2 className=" font-bold tracking-tight">Appointments</h2>
        {user.role === "PATIENT" && (
          <Link
            href="/dashboard/chambers/list"
            className="bg-green-500 rounded-full"
          >
            <Plus color="white" size={24} />
          </Link>
        )}
      </div>

      {renderAppointments()}
    </div>
  );
}
