//@ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const weekDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const weekNumbers = ["FIRST", "SECOND", "THIRD", "FOURTH", "LAST"] as const;

const chamberSchema = z.object({
  doctorId: z.string().min(1, "Please select a doctor"),
  weekNumber: z.enum(weekNumbers, {
    required_error: "Please select week number",
  }),
  weekDay: z.enum(weekDays, {
    required_error: "Please select day of week",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter valid time in HH:mm format",
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter valid time in HH:mm format",
  }),
  fees: z.coerce
    .number()
    .min(0, "Fees must be a positive number")
    .max(10000, "Fees cannot exceed ₹10,000"),
});

export default function NewChamberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(chamberSchema),
    defaultValues: {
      doctorId: "",
      weekNumber: undefined,
      weekDay: undefined,
      startTime: "",
      endTime: "",
      fees: 0,
    },
  });

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setDoctors(data);
    } catch (error) {
      toast.error("Failed to fetch doctors");
    }
  };

  const fetchDoctorChambers = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}/chambers`);
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setSelectedDoctor({ id: doctorId, chambers: data });
    } catch (error) {
      toast.error("Failed to fetch doctor's chambers");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function onSubmit(values: z.infer<typeof chamberSchema>) {
    try {
      setLoading(true);
      const response = await fetch("/api/chambers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Chamber added successfully!");
      router.push("/dashboard/chambers");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Chamber</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        fetchDoctorChambers(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedDoctor && selectedDoctor.chambers.length > 0 && (
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h3 className="font-medium">Existing Chambers</h3>
                  <div className="grid gap-3">
                    {selectedDoctor.chambers.map((chamber: any) => (
                      <div
                        key={chamber.id}
                        className="bg-background p-3 rounded-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {chamber.pharmacy.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {chamber.weekNumber} {chamber.weekDay} •{" "}
                              {chamber.startTime} - {chamber.endTime}
                            </p>
                          </div>
                          <Badge variant="outline">₹{chamber.fees}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="weekNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Week of Month</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select week" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weekNumbers.map((week) => (
                            <SelectItem key={week} value={week}>
                              {week.charAt(0) + week.slice(1).toLowerCase()}{" "}
                              Week
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
                  name="weekDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weekDays.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day.charAt(0) + day.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          placeholder="Enter start time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          placeholder="Enter end time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Fees (₹)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max="10000"
                        placeholder="Enter consultation fees"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Chamber"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
