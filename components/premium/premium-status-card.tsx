// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X, Calendar, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type PremiumStatus = {
  isPremium: boolean;
  membership: {
    id: string;
    planType: string;
    status: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    cancelledAt?: string | null;
  } | null;
};

export function PremiumStatusCard() {
  const router = useRouter();
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/premium/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching premium status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading premium status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  const { isPremium, membership } = status;

  if (!isPremium && !membership) {
    return (
      <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-600" />
              <CardTitle className="text-xl">Premium Membership</CardTitle>
            </div>
          </div>
          <CardDescription>Unlock exclusive features and benefits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>Priority booking</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>10% discount on consultation fees</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>Unlimited medical records access</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>Early access to new features</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>Premium customer support</span>
            </div>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            onClick={() => router.push("/dashboard/premium")}
          >
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isActive = membership?.status === "ACTIVE";
  const endDate = membership?.endDate ? new Date(membership.endDate) : null;
  const daysRemaining = endDate
    ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card className={isActive ? "border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" : "border-2 border-gray-200"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className={`w-6 h-6 ${isActive ? "text-green-600" : "text-gray-400"}`} />
            <CardTitle className="text-xl">Premium Membership</CardTitle>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-600" : ""}
          >
            {membership?.status}
          </Badge>
        </div>
        <CardDescription>
          {isActive ? "You're enjoying premium benefits!" : "Your membership is inactive"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {membership && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold">{membership.planType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Auto Renew:</span>
                <span className="font-semibold">
                  {membership.autoRenew ? (
                    <Check className="w-4 h-4 text-green-600 inline" />
                  ) : (
                    <X className="w-4 h-4 text-red-600 inline" />
                  )}
                </span>
              </div>
              {endDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {isActive ? "Expires:" : "Expired:"}
                  </span>
                  <span className="font-semibold">
                    {format(endDate, "MMM dd, yyyy")}
                  </span>
                </div>
              )}
              {isActive && daysRemaining > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Days Remaining:</span>
                  <span className="font-semibold text-green-600">{daysRemaining} days</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {isActive && membership.planType !== "LIFETIME" && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/dashboard/premium?action=renew")}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Renew
                </Button>
              )}
              {isActive && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/dashboard/premium?action=cancel")}
                >
                  Cancel
                </Button>
              )}
              {!isActive && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => router.push("/dashboard/premium")}
                >
                  Reactivate
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

