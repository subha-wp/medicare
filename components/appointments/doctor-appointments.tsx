"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  slotNumber: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  patient: {
    name: string;
    bloodGroup: string;
    dateOfBirth: string;
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

export function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/doctor/appointments");
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicalRecord = async (appointmentId: string, data: any) => {
    try {
      setIsAddingRecord(true);
      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, ...data }),
      });

      const result = await response.json();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Medical record added successfully");
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to add medical record");
    } finally {
      setIsAddingRecord(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span>{format(new Date(appointment.date), "PPP")}</span>
                  <span className="text-sm text-muted-foreground">
                    {appointment.chamber.startTime} -{" "}
                    {appointment.chamber.endTime}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{appointment.patient.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Blood Group: {appointment.patient.bloodGroup} • Age:{" "}
                    {new Date().getFullYear() -
                      new Date(appointment.patient.dateOfBirth).getFullYear()}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{appointment.chamber.pharmacy.businessName}</span>
                  <span className="text-sm text-muted-foreground">
                    {appointment.chamber.pharmacy.address}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    appointment.status === "COMPLETED"
                      ? "default"
                      : appointment.status === "CONFIRMED"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {appointment.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {appointment.paymentStatus} - {appointment.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell>
                {!appointment.medicalRecord &&
                  appointment.status !== "CANCELLED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      Add Record
                    </Button>
                  )}
                {appointment.medicalRecord && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    View Record
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedAppointment}
        onOpenChange={() => setSelectedAppointment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment?.medicalRecord
                ? "Medical Record"
                : "Add Medical Record"}
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment?.medicalRecord ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Diagnosis</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment.medicalRecord.diagnosis}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Prescription</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedAppointment.medicalRecord.prescription}
                </p>
              </div>
              {selectedAppointment.medicalRecord.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.medicalRecord.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedAppointment) return;

                const formData = new FormData(e.currentTarget);
                handleAddMedicalRecord(selectedAppointment.id, {
                  diagnosis: formData.get("diagnosis"),
                  prescription: formData.get("prescription"),
                  notes: formData.get("notes"),
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnosis</label>
                <Input name="diagnosis" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prescription</label>
                <Textarea name="prescription" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea name="notes" />
              </div>
              <Button type="submit" disabled={isAddingRecord}>
                {isAddingRecord ? "Saving..." : "Save Record"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
