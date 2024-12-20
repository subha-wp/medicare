import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DoctorSearch } from "@/components/doctors/doctor-search";
import { DoctorList } from "@/components/doctors/doctor-list";

export default async function DoctorsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");
  if (user.role !== "PATIENT") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Find Doctors</h2>
        <p className="text-muted-foreground">
          Search for doctors by name or specialization
        </p>
      </div>

      <DoctorSearch />
      <DoctorList />
    </div>
  );
}
