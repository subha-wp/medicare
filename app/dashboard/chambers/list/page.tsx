import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChamberList } from "@/components/chambers/chamber-list";
import { ChamberSearch } from "./ChamberSearch";

export default async function ChambersListPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-3 p-2">
      <h2 className="font-bold tracking-tight">Available Chambers</h2>
      <ChamberSearch />
      <ChamberList />
    </div>
  );
}
