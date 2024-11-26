/* eslint-disable react-hooks/exhaustive-deps */
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format, addDays, isSameDay, getDate } from "date-fns";
import { AppointmentSlot } from "./appointment-slot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

type Chamber = {
  id: string;
  weekNumber: "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "LAST";
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
    businessName: string;
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

function getWeekNumberOfMonth(
  date: Date
): "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "LAST" {
  const dayOfMonth = getDate(date);

  if (dayOfMonth <= 7) return "FIRST";
  if (dayOfMonth <= 14) return "SECOND";
  if (dayOfMonth <= 21) return "THIRD";
  if (dayOfMonth <= 28) return "FOURTH";
  return "LAST";
}

function getNextValidDates(chamber: Chamber, count: number = 3): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date();

  while (dates.length < count) {
    // Find the next occurrence of the weekday
    while (
      currentDate.getDay() !==
      weekDays[chamber.weekDay as keyof typeof weekDays]
    ) {
      currentDate = addDays(currentDate, 1);
    }

    // Check if it matches the week number
    if (getWeekNumberOfMonth(currentDate) === chamber.weekNumber) {
      // Check if it's not past the chamber time for today
      if (
        !isSameDay(currentDate, new Date()) ||
        !isTimePassed(chamber, currentDate)
      ) {
        dates.push(new Date(currentDate));
      }
    }

    currentDate = addDays(currentDate, 7);
  }

  return dates;
}

function isTimePassed(chamber: Chamber, date: Date): boolean {
  if (!isSameDay(date, new Date())) return false;

  const [hours, minutes] = chamber.startTime.split(":");
  const chamberTime = new Date(date);
  chamberTime.setHours(parseInt(hours), parseInt(minutes), 0);

  return new Date() > chamberTime;
}

export function AppointmentDrawer({
  chamber,
  open,
  onClose,
}: AppointmentDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">(
    "ONLINE"
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [slotAvailability, setSlotAvailability] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (chamber && open) {
      const dates = getNextValidDates(chamber);
      setAvailableDates(dates);
      setSelectedDate(dates[0]);

      // Fetch slot availability for all dates
      dates.forEach(fetchSlotAvailability);
    }
  }, [chamber, open]);

  const fetchSlotAvailability = async (date: Date) => {
    if (!chamber) return;

    try {
      const response = await fetch(
        `/api/chambers/${chamber.id}/slots?date=${date.toISOString()}`
      );
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSlotAvailability((prev) => ({
        ...prev,
        [date.toISOString()]: data.bookedSlots,
      }));
    } catch (error) {
      console.error("Failed to fetch slot availability:", error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !chamber) return;

    try {
      setLoading(true);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamberId: chamber.id,
          date: selectedDate.toISOString(),
          slotNumber: selectedSlot,
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

  if (!chamber) return null;

  const getAvailableSlots = (date: Date) => {
    const bookedSlots = slotAvailability[date.toISOString()] || 0;
    return chamber.maxSlots - bookedSlots;
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm pb-4">
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
                  {chamber.pharmacy.businessName}
                  <br />
                  {chamber.pharmacy.address}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Schedule</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {chamber.weekNumber.charAt(0) +
                    chamber.weekNumber.slice(1).toLowerCase()}{" "}
                  {chamber.weekDay.charAt(0) +
                    chamber.weekDay.slice(1).toLowerCase()}{" "}
                  of every month
                  <br />
                  Time: {chamber.startTime} - {chamber.endTime}
                </p>
                <ScrollArea className="w-full  rounded-md border">
                  <div className="flex w-max space-x-4 p-4">
                    {availableDates.map((date) => (
                      <AppointmentSlot
                        key={date.toISOString()}
                        date={date}
                        totalSlots={chamber.maxSlots}
                        bookedSlots={slotAvailability[date.toISOString()] || 0}
                        isSelected={
                          selectedDate?.toISOString() === date.toISOString()
                        }
                        onSelect={() => setSelectedDate(date)}
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              {selectedDate && getAvailableSlots(selectedDate) > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Select Slot</h4>
                  <Select
                    value={selectedSlot.toString()}
                    onValueChange={(value) => setSelectedSlot(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: getAvailableSlots(selectedDate) },
                        (_, i) => i + 1
                      ).map((slot) => (
                        <SelectItem key={slot} value={slot.toString()}>
                          Slot {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                disabled={
                  loading ||
                  !selectedDate ||
                  getAvailableSlots(selectedDate) <= 0
                }
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
