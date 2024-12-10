import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

import { PharmacySearch } from "@/components/pharmacyComp/pharmacy-search";
import { PharmacyList } from "@/components/pharmacyComp/pharmacy-list";

export default async function PharmaciesPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");
  if (user.role !== "PATIENT") redirect("/dashboard");

  return (
    <div className="space-y-6 mb-16">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Find Pharmacies</h2>
        <p className="text-muted-foreground">Search for pharmacies near you</p>
      </div>

      <PharmacySearch />
      <PharmacyList />
    </div>
  );
}
