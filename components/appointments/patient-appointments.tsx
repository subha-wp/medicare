"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";

type Appointment = {
  id: string;
  date: string;
  slotNumber: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  amount: number;
  doctor: {
    name: string;
    specialization: string;
  };
  chamber: {
    startTime: string;
    endTime: string;
    pharmacy: {
      businessName: string;
      address: string;
    };
  };
  medicalRecord?: {
    diagnosis: string;
    prescription: string;
    notes?: string;
  };
};

export function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/patient/appointments");
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setCancelling(true);
      const response = await fetch(
        `/api/appointments/${selectedAppointment.id}/cancel`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      toast.success("Appointment cancelled successfully");
      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: "CANCELLED" }
            : apt
        )
      );
      setSelectedAppointment(null);
      setCancelConfirmOpen(false);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    } finally {
      setCancelling(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const AppointmentDetails = () => (
    <>
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium">Doctor</h4>
          <p className="text-sm mt-1">{selectedAppointment?.doctor.name}</p>
          <p className="text-sm text-muted-foreground">
            {selectedAppointment?.doctor.specialization}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium">Date & Time</h4>
          <p className="text-sm mt-1">
            {format(new Date(selectedAppointment?.date || ""), "PPP")}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatTime(selectedAppointment?.chamber.startTime || "")} -{" "}
            {formatTime(selectedAppointment?.chamber.endTime || "")}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium">Location</h4>
          <p className="text-sm mt-1">
            {selectedAppointment?.chamber.pharmacy.businessName}
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedAppointment?.chamber.pharmacy.address}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium">Payment Details</h4>
          <p className="text-sm mt-1">Amount: ₹{selectedAppointment?.amount}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline">
              {selectedAppointment?.paymentStatus}
            </Badge>
            <Badge variant="outline">
              {selectedAppointment?.paymentMethod}
            </Badge>
          </div>
        </div>

        {selectedAppointment?.medicalRecord && (
          <div>
            <h4 className="text-sm font-medium">Medical Record</h4>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-sm font-medium">Diagnosis</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment.medicalRecord.diagnosis}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Prescription</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedAppointment.medicalRecord.prescription}
                </p>
              </div>
              {selectedAppointment.medicalRecord.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.medicalRecord.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedAppointment?.status === "PENDING" && (
        <Button
          variant="destructive"
          className="w-full mt-6"
          onClick={() => setCancelConfirmOpen(true)}
        >
          Cancel Appointment
        </Button>
      )}
    </>
  );

  const CancelConfirmationDialog = () => (
    <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCancelConfirmOpen(false)}
            disabled={cancelling}
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelAppointment}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No appointments found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card
          key={appointment.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedAppointment(appointment)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{appointment.doctor.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {appointment.doctor.specialization}
                </p>
              </div>
              <Badge
                variant={
                  appointment.status === "COMPLETED"
                    ? "default"
                    : appointment.status === "CANCELLED"
                    ? "destructive"
                    : "secondary"
                }
              >
                {appointment.status}
              </Badge>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                {format(new Date(appointment.date), "PPP")}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTime(appointment.chamber.startTime)} -{" "}
                {formatTime(appointment.chamber.endTime)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      {isDesktop ? (
        <Dialog
          open={!!selectedAppointment}
          onOpenChange={() => setSelectedAppointment(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            <AppointmentDetails />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          open={!!selectedAppointment}
          onOpenChange={() => setSelectedAppointment(null)}
        >
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Appointment Details</DrawerTitle>
            </DrawerHeader>
            <div className="px-4">
              <AppointmentDetails />
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      <CancelConfirmationDialog />
    </div>
  );
}
