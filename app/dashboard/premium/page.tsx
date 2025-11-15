// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Calendar, CreditCard, X, Loader2 } from "lucide-react";
import { PremiumPurchaseModal } from "@/components/premium/premium-purchase-modal";
import { PremiumStatusCard } from "@/components/premium/premium-status-card";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  recentPayments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
  }>;
};

const BENEFITS = [
  "Priority booking for appointments",
  "10% discount on all consultation fees",
  "Unlimited access to medical records",
  "Early access to new features and updates",
  "Premium customer support with priority queue",
  "Advanced health analytics and reports",
  "Unlimited appointment cancellations and rescheduling",
];

export default function PremiumPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [renewing, setRenewing] = useState(false);

  useEffect(() => {
    fetchStatus();
    if (action === "purchase") {
      setPurchaseModalOpen(true);
    } else if (action === "cancel") {
      setCancelModalOpen(true);
    } else if (action === "renew") {
      handleRenew();
    }
  }, [action]);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/premium/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching premium status:", error);
      toast.error("Failed to load premium status");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = () => {
    fetchStatus();
    router.push("/dashboard/premium");
  };

  const handleCancel = async () => {
    if (!status?.membership) return;

    setCancelling(true);
    try {
      const response = await fetch("/api/premium/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cancelReason || undefined,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Premium membership cancelled successfully");
      setCancelModalOpen(false);
      setCancelReason("");
      fetchStatus();
      router.push("/dashboard/premium");
    } catch (error) {
      console.error("Error cancelling premium:", error);
      toast.error("Failed to cancel premium membership");
    } finally {
      setCancelling(false);
    }
  };

  const handleRenew = async () => {
    if (!status?.membership) return;

    setRenewing(true);
    try {
      const response = await fetch("/api/premium/renew", {
        method: "POST",
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Premium membership renewed successfully!");
      fetchStatus();
      router.push("/dashboard/premium");
    } catch (error) {
      console.error("Error renewing premium:", error);
      toast.error("Failed to renew premium membership");
    } finally {
      setRenewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const isPremium = status?.isPremium || false;
  const membership = status?.membership;

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-600" />
          <h1 className="text-3xl font-bold">Premium Membership</h1>
        </div>
        {!isPremium && (
          <Button
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            onClick={() => setPurchaseModalOpen(true)}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        )}
      </div>

      {/* Status Card */}
      <PremiumStatusCard />

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Benefits</CardTitle>
          <CardDescription>Everything you get with premium membership</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {status?.recentPayments && status.recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your premium membership payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-semibold">₹{payment.amount}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(payment.createdAt), "MMM dd, yyyy")} •{" "}
                        {payment.paymentMethod}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      payment.paymentStatus === "PAID" ? "default" : "secondary"
                    }
                    className={
                      payment.paymentStatus === "PAID" ? "bg-green-600" : ""
                    }
                  >
                    {payment.paymentStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Modal */}
      <PremiumPurchaseModal
        open={purchaseModalOpen}
        onClose={() => {
          setPurchaseModalOpen(false);
          router.push("/dashboard/premium");
        }}
        onSuccess={handlePurchaseSuccess}
      />

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Premium Membership</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your premium membership? Your benefits will
              continue until the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Reason for cancellation (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Please let us know why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} disabled={cancelling}>
              Keep Membership
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Membership"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              <span>Renewing membership...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

