// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Share2, 
  Copy, 
  Gift, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  Loader2,
  MessageCircle,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ReferralStats = {
  code: string;
  usedCount: number;
  totalEarnings: number;
  pendingRewards: number;
  recentReferrals: Array<{
    id: string;
    referredName: string;
    rewardAmount: number;
    status: string;
    createdAt: string;
  }>;
  referralUrl: string;
};

export function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/referrals/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        // Update referralUrl from response
        if (data.referralUrl) {
          setStats((prev) => prev ? { ...prev, referralUrl: data.referralUrl } : null);
        }
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      toast.error("Failed to load referral stats");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Join BookMyChamber using my referral code: ${stats?.code}\n\nGet ₹50 credit when you book your first appointment!\n\n${stats?.referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareViaSMS = () => {
    const message = `Join BookMyChamber using my referral code: ${stats?.code}. Get ₹50 credit! ${stats?.referralUrl}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Failed to load referral stats</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Gift className="w-6 h-6 text-green-600" />
                Your Referral Program
              </CardTitle>
              <CardDescription className="mt-2">
                Share your code and earn rewards when friends book appointments
              </CardDescription>
            </div>
            <Badge className="bg-green-600 text-white px-3 py-1">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Your Referral Code
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={stats.code}
                readOnly
                className="text-2xl font-bold text-center tracking-wider bg-white"
              />
              <Button
                onClick={() => copyToClipboard(stats.code)}
                variant="outline"
                size="icon"
                className="h-10 w-10"
              >
                {copied ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
              <Button
                onClick={() => setShareModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Referrals</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.usedCount}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Total Earnings</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Pending</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">₹{stats.pendingRewards}</div>
            </div>
          </div>

          {/* Referral URL */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Referral Link
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={stats.referralUrl}
                readOnly
                className="bg-white text-sm"
              />
              <Button
                onClick={() => copyToClipboard(stats.referralUrl)}
                variant="outline"
                size="icon"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      {stats.recentReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>People who used your referral code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentReferrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{referral.referredName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        referral.status === "PAID" || referral.status === "APPROVED"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        referral.status === "PAID" || referral.status === "APPROVED"
                          ? "bg-green-600"
                          : ""
                      }
                    >
                      ₹{referral.rewardAmount}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{referral.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Referral Code</DialogTitle>
            <DialogDescription>
              Share your code and earn rewards when friends book appointments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button
                onClick={shareViaWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share via WhatsApp
              </Button>
              <Button
                onClick={shareViaSMS}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Share via SMS
              </Button>
              <Button
                onClick={() => copyToClipboard(stats.referralUrl)}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Your referral code:</p>
              <p className="text-2xl font-bold text-center tracking-wider">{stats.code}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


