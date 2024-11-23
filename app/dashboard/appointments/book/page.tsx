//dashboard/appoinments/book/page.tsx
//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const appointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  slotNumber: z.coerce.number().min(1, "Please select a slot"),
  paymentMethod: z.enum(["ONLINE", "CASH"]),
});

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chamberId = searchParams.get("chamber");
  const [loading, setLoading] = useState(false);
  const [chamberDetails, setChamberDetails] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: "",
      slotNumber: 0,
      paymentMethod: "ONLINE",
    },
  });

  useEffect(() => {
    if (chamberId) {
      fetchChamberDetails(chamberId);
    }
  }, [chamberId]);

  useEffect(() => {
    if (chamberId && form.watch("date")) {
      fetchAvailableSlots(chamberId, form.watch("date"));
    }
  }, [chamberId, form.watch("date")]);

  async function fetchChamberDetails(chamberId) {
    try {
      const response = await fetch(`/api/chambers/${chamberId}`);
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setChamberDetails(data.chamber);
      }
    } catch (error) {
      toast.error("Failed to fetch chamber details");
    }
  }

  async function fetchAvailableSlots(chamberId, date) {
    try {
      const response = await fetch(
        `/api/chambers/${chamberId}/slots?date=${date}`
      );
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setAvailableSlots(data.slots);
      }
    } catch (error) {
      toast.error("Failed to fetch available slots");
    }
  }

  async function onSubmit(values: z.infer<typeof appointmentSchema>) {
    if (!chamberId) {
      toast.error("Chamber ID is missing");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, chamberId }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Appointment booked successfully!");
      router.push("/dashboard/appointments");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
      </CardHeader>
      <CardContent>
        {chamberDetails && (
          <div className="mb-4">
            <p>Doctor: {chamberDetails.doctor.name}</p>
            <p>Pharmacy: {chamberDetails.pharmacy.name}</p>
            <p>Day: {chamberDetails.weekDay.toLowerCase()}</p>
            <p>
              Time: {chamberDetails.startTime} - {chamberDetails.endTime}
            </p>
            <p>Fees: ₹{chamberDetails.fees}</p>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      onChange={(e) => {
                        field.onChange(e);
                        form.setValue("slotNumber", 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slotNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Slot</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem
                          key={slot.slotNumber}
                          value={slot.slotNumber.toString()}
                        >
                          {slot.startTime} - {slot.endTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
