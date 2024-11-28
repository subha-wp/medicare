"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Chamber = {
  id: string;
  weekNumber: string;
  weekDay: string;
  startTime: string;
  endTime: string;
  fees: number;
  pharmacy: {
    businessName: string;
    address: string;
  };
};

type DoctorChambersDialogProps = {
  doctor: {
    id: string;
    name: string;
    specialization: string;
  } | null;
  open: boolean;
  onClose: () => void;
};

export function DoctorChambersDialog({
  doctor,
  open,
  onClose,
}: DoctorChambersDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [chambers, setChambers] = useState<Chamber[]>([]);

  useEffect(() => {
    const fetchChambers = async () => {
      if (!doctor?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/doctors/${doctor.id}/chambers`);
        const data = await response.json();
        setChambers(data.chambers || []);
      } catch (error) {
        console.error("Error fetching chambers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchChambers();
    }
  }, [doctor?.id, open]);

  const handleBookAppointment = (chamberId: string) => {
    router.push(`/dashboard/appointments/book?chamber=${chamberId}`);
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dr. {doctor.name}&apos;s Chambers</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : chambers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active chambers found.
          </div>
        ) : (
          <div className="grid gap-4">
            {chambers.map((chamber) => (
              <div
                key={chamber.id}
                className="flex flex-col gap-2 p-4 border rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {chamber.pharmacy.businessName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {chamber.pharmacy.address}
                    </p>
                  </div>
                  <Badge variant="outline">₹{chamber.fees}</Badge>
                </div>

                <div className="flex gap-2 text-sm">
                  <Badge variant="secondary">
                    {chamber.weekNumber.charAt(0) +
                      chamber.weekNumber.slice(1).toLowerCase()}{" "}
                    {chamber.weekDay.charAt(0) +
                      chamber.weekDay.slice(1).toLowerCase()}
                  </Badge>
                  <Badge variant="secondary">
                    {chamber.startTime} - {chamber.endTime}
                  </Badge>
                </div>

                <Button
                  className="mt-2"
                  onClick={() => handleBookAppointment(chamber.id)}
                >
                  Book Appointment
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
