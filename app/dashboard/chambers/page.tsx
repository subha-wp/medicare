"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Chamber = {
  id: string;
  weekNumber: string;
  weekDay: string;
  startTime: string;
  endTime: string;
  fees: number;
  isActive: boolean;
  isVerified: boolean;
  verificationDate: string | null;
  verificationNotes: string | null;
  doctor: {
    name: string;
    specialization: string;
  };
};

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hoursNum = parseInt(hours, 10);
  const ampm = hoursNum >= 12 ? "PM" : "AM";
  const formattedHours = hoursNum % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}

export default function ChambersPage() {
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chamberToDelete, setChamberToDelete] = useState<string | null>(null);
  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    chamber: Chamber | null;
  }>({ open: false, chamber: null });

  useEffect(() => {
    fetchChambers();
  }, []);

  const fetchChambers = async () => {
    try {
      const response = await fetch("/api/chambers");
      if (!response.ok) {
        throw new Error("Failed to fetch chambers");
      }
      const data = await response.json();
      setChambers(data.chambers);
    } catch (error) {
      console.error("Error fetching chambers:", error);
      toast.error("Failed to load chambers");
    } finally {
      setLoading(false);
    }
  };

  const toggleChamberStatus = async (chamberId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/chambers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chamberId, isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update chamber status");
      }

      setChambers((prevChambers) =>
        prevChambers.map((chamber) =>
          chamber.id === chamberId ? { ...chamber, isActive } : chamber
        )
      );

      toast.success(`Chamber ${isActive ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Error updating chamber status:", error);
      toast.error("Failed to update chamber status");
    }
  };

  const toggleVerificationStatus = async (
    chamberId: string,
    isVerified: boolean
  ) => {
    try {
      const response = await fetch("/api/chambers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamberId,
          isVerified,
          verificationNotes: isVerified
            ? "Verified by pharmacy"
            : "Verification removed",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update verification status");
      }

      setChambers((prevChambers) =>
        prevChambers.map((chamber) =>
          chamber.id === chamberId
            ? {
                ...chamber,
                isVerified,
                verificationDate: isVerified ? new Date().toISOString() : null,
              }
            : chamber
        )
      );

      toast.success(
        `Chamber ${isVerified ? "verified" : "unverified"} successfully`
      );
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast.error("Failed to update verification status");
    }
  };

  const openDeleteDialog = (chamberId: string) => {
    setChamberToDelete(chamberId);
    setIsDeleteDialogOpen(true);
  };

  const deleteChamber = async () => {
    if (!chamberToDelete) return;

    try {
      const response = await fetch(`/api/chambers?id=${chamberToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chamber");
      }

      setChambers((prevChambers) =>
        prevChambers.filter((chamber) => chamber.id !== chamberToDelete)
      );

      toast.success("Chamber deleted successfully");
    } catch (error) {
      console.error("Error deleting chamber:", error);
      toast.error("Failed to delete chamber");
    } finally {
      setIsDeleteDialogOpen(false);
      setChamberToDelete(null);
    }
  };

  if (loading) {
    return <div>Loading chambers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Chambers</h2>
        <Link href="/dashboard/chambers/new">
          <Button>Add New Chamber</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chambers.map((chamber) => (
          <Card key={chamber.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{chamber.doctor.name}</span>
                <Switch
                  checked={chamber.isActive}
                  onCheckedChange={(checked) =>
                    toggleChamberStatus(chamber.id, checked)
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  {chamber.doctor.specialization}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {chamber.weekNumber} {chamber.weekDay}
                </p>
                <p className="text-sm">
                  {formatTime(chamber.startTime)} -{" "}
                  {formatTime(chamber.endTime)}
                </p>
                <p className="text-sm font-medium">Fees: ₹{chamber.fees}</p>
                <div className="flex justify-between">
                  <Badge variant={chamber.isActive ? "default" : "destructive"}>
                    {chamber.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge
                    variant={chamber.isVerified ? "default" : "secondary"}
                    className={
                      chamber.isVerified ? "bg-green-600" : "bg-yellow-600"
                    }
                  >
                    {chamber.isVerified ? "✓ Verified" : "⚠ Unverified"}
                  </Badge>
                </div>

                <div className="flex justify-between mt-2">
                  <Button
                    variant={chamber.isVerified ? "destructive" : "default"}
                    size="sm"
                    onClick={() =>
                      toggleVerificationStatus(chamber.id, !chamber.isVerified)
                    }
                  >
                    {chamber.isVerified
                      ? "Remove Verification"
                      : "Verify Chamber"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(chamber.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chamber? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteChamber}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
