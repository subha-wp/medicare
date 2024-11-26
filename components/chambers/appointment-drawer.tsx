import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { format, addDays, isSameDay } from "date-fns";

type Chamber = {
  id: string;
  weekNumber: string;
  weekDay: string;
  startTime: string;
  endTime: string;
  fees: number;
  maxSlots: number;
  doctor: {
    name: string;
    specialization: string;
  };
  pharmacy: {
    name: string;
    address: string;
  };
};

interface AppointmentDrawerProps {
  chamber: Chamber | null;
  open: boolean;
  onClose: () => void;
}

const weekDays = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0,
};

export function AppointmentDrawer({
  chamber,
  open,
  onClose,
}: AppointmentDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">(
    "ONLINE"
  );

  if (!chamber) return null;

  const getNextAppointmentDate = () => {
    const today = new Date();
    const targetDay = weekDays[chamber.weekDay as keyof typeof weekDays];
    let nextDate = today;

    while (nextDate.getDay() !== targetDay) {
      nextDate = addDays(nextDate, 1);
    }

    // If today is the target day but it's past the chamber time, move to next week
    if (isSameDay(today, nextDate)) {
      const [hours, minutes] = chamber.startTime.split(":");
      const chamberTime = new Date(nextDate);
      chamberTime.setHours(parseInt(hours), parseInt(minutes), 0);

      if (today > chamberTime) {
        nextDate = addDays(nextDate, 7);
      }
    }

    return nextDate;
  };

  const handleBookAppointment = async () => {
    try {
      setLoading(true);
      const appointmentDate = getNextAppointmentDate();

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamberId: chamber.id,
          date: appointmentDate.toISOString(),
          slotNumber: 1, // You might want to let users choose slots
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Appointment booked successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Book Appointment</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Doctor Details</h4>
                <p className="text-sm text-muted-foreground">
                  {chamber.doctor.name} - {chamber.doctor.specialization}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Location</h4>
                <p className="text-sm text-muted-foreground">
                  {chamber.pharmacy.name}
                  <br />
                  {chamber.pharmacy.address}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Schedule</h4>
                <p className="text-sm text-muted-foreground">
                  Next available: {format(getNextAppointmentDate(), "PPP")}
                  <br />
                  Time: {chamber.startTime} - {chamber.endTime}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Consultation Fee</h4>
                <p className="text-sm text-muted-foreground">₹{chamber.fees}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Payment Method</h4>
                <RadioGroup
                  defaultValue={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as "ONLINE" | "CASH")
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ONLINE" id="online" />
                    <Label htmlFor="online">Online Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CASH" id="cash" />
                    <Label htmlFor="cash">Cash Payment</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                className="w-full"
                onClick={handleBookAppointment}
                disabled={loading}
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
