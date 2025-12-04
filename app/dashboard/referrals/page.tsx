// @ts-nocheck
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReferralDashboard } from "@/components/referrals/referral-dashboard";

export default async function ReferralsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
          <p className="text-gray-600 mt-2">
            Share your code and earn rewards when friends book appointments
          </p>
        </div>
        <ReferralDashboard />
      </div>
    </div>
  );
}


