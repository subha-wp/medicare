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
  };
  doctor: {
    name: string;
    specialization: string;
  };
  chamber: {
    startTime: string;
    endTime: string;
    fees: number;
  };
  medicalRecord?: {
    diagnosis: string;
    prescription: string;
    notes?: string;
  };
};

export function PharmacyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Appointment | null>(
    null
  );

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/pharmacy/appointments");
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
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
            <TableHead>Doctor</TableHead>
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
              <TableCell>{appointment.patient.name}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{appointment.doctor.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {appointment.doctor.specialization}
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
                <div className="flex flex-col">
                  <Badge variant="outline">
                    {appointment.paymentStatus} - {appointment.paymentMethod}
                  </Badge>
                  <span className="text-sm text-muted-foreground mt-1">
                    ₹{appointment.chamber.fees}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {appointment.medicalRecord && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRecord(appointment)}
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
        open={!!selectedRecord}
        onOpenChange={() => setSelectedRecord(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medical Record</DialogTitle>
          </DialogHeader>
          {selectedRecord?.medicalRecord && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Diagnosis</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedRecord.medicalRecord.diagnosis}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Prescription</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedRecord.medicalRecord.prescription}
                </p>
              </div>
              {selectedRecord.medicalRecord.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecord.medicalRecord.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
