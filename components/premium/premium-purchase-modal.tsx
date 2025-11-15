// @ts-nocheck
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Crown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type PlanType = "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";

const PLAN_DETAILS = {
  MONTHLY: {
    name: "Monthly",
    price: 299,
    duration: "30 days",
    savings: "",
  },
  QUARTERLY: {
    name: "Quarterly",
    price: 799,
    duration: "90 days",
    savings: "Save 11%",
  },
  YEARLY: {
    name: "Yearly",
    price: 2499,
    duration: "365 days",
    savings: "Save 30%",
  },
  LIFETIME: {
    name: "Lifetime",
    price: 9999,
    duration: "Forever",
    savings: "Best Value",
  },
};

const BENEFITS = [
  "Priority booking",
  "10% discount on consultation fees",
  "Unlimited medical records access",
  "Early access to new features",
  "Premium customer support",
];

type PremiumPurchaseModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function PremiumPurchaseModal({
  open,
  onClose,
  onSuccess,
}: PremiumPurchaseModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("MONTHLY");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("ONLINE");
  const [autoRenew, setAutoRenew] = useState(true);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/premium/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: selectedPlan,
          paymentMethod,
          autoRenew,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(data.message || "Premium membership purchased successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error purchasing premium:", error);
      toast.error("Failed to purchase premium membership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            <DialogTitle>Upgrade to Premium</DialogTitle>
          </div>
          <DialogDescription>
            Choose a plan and unlock exclusive features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benefits */}
          <div className="bg-green-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm mb-2">Premium Benefits:</h3>
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Plan Selection */}
          <div className="space-y-3">
            <Label>Select Plan</Label>
            <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as PlanType)}>
              {Object.entries(PLAN_DETAILS).map(([key, plan]) => (
                <div key={key} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={key} id={key} />
                  <Label
                    htmlFor={key}
                    className="flex-1 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">{plan.name}</div>
                      <div className="text-sm text-gray-500">{plan.duration}</div>
                      {plan.savings && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {plan.savings}
                        </Badge>
                      )}
                    </div>
                    <div className="text-lg font-bold">₹{plan.price}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "ONLINE" | "CASH")}>
              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="ONLINE" id="online" />
                <Label htmlFor="online" className="flex-1 cursor-pointer">
                  Online Payment
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <RadioGroupItem value="CASH" id="cash" />
                <Label htmlFor="cash" className="flex-1 cursor-pointer">
                  Cash Payment
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Auto Renew */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRenew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="autoRenew" className="cursor-pointer">
              Auto-renew membership
            </Label>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-green-600">
              ₹{PLAN_DETAILS[selectedPlan].price}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Purchase Premium"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

