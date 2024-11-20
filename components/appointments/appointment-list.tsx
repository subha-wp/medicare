// components/appointments/appointment-list.tsx
"use client";

import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AppointmentListProps {
  appointments: any[];
  userRole: string;
}

export function AppointmentList({
  appointments,
  userRole,
}: AppointmentListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAddMedicalRecord = async (appointmentId: string, data: any) => {
    try {
      setLoading(true);
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
    } catch (error) {
      toast.error("Failed to add medical record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {userRole !== "PATIENT" && <TableHead>Patient</TableHead>}
            {userRole !== "DOCTOR" && <TableHead>Doctor</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{format(new Date(appointment.date), "PPP")}</TableCell>
              {userRole !== "PATIENT" && (
                <TableCell>{appointment.patient?.name}</TableCell>
              )}
              {userRole !== "DOCTOR" && (
                <TableCell>
                  {appointment.doctor?.name}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {appointment.doctor?.specialization}
                  </span>
                </TableCell>
              )}
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
                {userRole === "DOCTOR" && !appointment.medicalRecord && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        Add Medical Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Medical Record</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleAddMedicalRecord(appointment.id, {
                            diagnosis: formData.get("diagnosis"),
                            prescription: formData.get("prescription"),
                            notes: formData.get("notes"),
                          });
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Diagnosis
                          </label>
                          <Input name="diagnosis" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Prescription
                          </label>
                          <Textarea name="prescription" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea name="notes" />
                        </div>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Saving..." : "Save Record"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
                {appointment.medicalRecord && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        View Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Medical Record</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Diagnosis</h4>
                          <p className="text-sm text-muted-foreground">
                            {appointment.medicalRecord.diagnosis}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Prescription</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {appointment.medicalRecord.prescription}
                          </p>
                        </div>
                        {appointment.medicalRecord.notes && (
                          <div>
                            <h4 className="font-medium">Notes</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.medicalRecord.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {appointments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No appointments found.
        </div>
      )}
    </div>
  );
}
