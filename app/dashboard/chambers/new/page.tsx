"use client";

import { useState, useEffect } from "react";
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
import { Search, Loader2 } from "lucide-react";

const weekNumbers = ["FIRST", "SECOND", "THIRD", "FOURTH", "LAST"] as const;
const weekDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const chamberSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  weekNumber: z.enum(weekNumbers, {
    required_error: "Please select a week number",
  }),
  weekDay: z.enum(weekDays, {
    required_error: "Please select a day of the week",
  }),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  fees: z.coerce
    .number()
    .min(0, "Fees must be a positive number")
    .max(10000, "Fees cannot exceed ₹10,000"),
  slotDuration: z.coerce
    .number()
    .min(5, "Slot duration must be at least 5 minutes")
    .max(60, "Slot duration cannot exceed 60 minutes"),
  maxSlots: z.coerce
    .number()
    .min(1, "At least one slot is required")
    .max(50, "Maximum 50 slots allowed per session"),
});

type Doctor = {
  id: string;
  name: string;
  specialization: string;
};

export default function NewChamberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<z.infer<typeof chamberSchema>>({
    resolver: zodResolver(chamberSchema),
    defaultValues: {
      doctorId: "",
      weekNumber: "FIRST",
      weekDay: "MONDAY",
      startTime: "09:00",
      endTime: "17:00",
      fees: 500,
      slotDuration: 15,
      maxSlots: 4,
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) =>
      console.log(name, value, type)
    );
    return () => subscription.unsubscribe();
  }, [form]);

  const searchDoctors = async (query: string) => {
    setSearchQuery(query);
    if (!query || query.length < 2) {
      setDoctors([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(
        `/api/doctors/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        setDoctors([]);
        return;
      }

      setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
    } catch (error) {
      console.error("Error searching doctors:", error);
      toast.error("Failed to search doctors. Please try again.");
      setDoctors([]);
    } finally {
      setSearchLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof chamberSchema>) {
    console.log("Form submitted with values:", values);

    if (!form.formState.isValid) {
      console.error("Form is not valid:", form.formState.errors);
      toast.error("Please fill all required fields correctly");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending request to create chamber...");
      const response = await fetch("/api/chambers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response from server:", data);

      if (data.error) {
        console.error("Server returned an error:", data.error);
        toast.error(data.error);
        return;
      }

      toast.success("Chamber created successfully!");
      router.push("/dashboard/chambers");
    } catch (error) {
      console.error("Error creating chamber:", error);
      toast.error("Failed to create chamber. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Chamber</CardTitle>
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
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Search for a doctor..."
                          value={searchQuery}
                          onChange={(e) => searchDoctors(e.target.value)}
                        />
                        {searchLoading && (
                          <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </FormControl>
                    {doctors.length > 0 && (
                      <ul className="mt-2 max-h-60 overflow-auto border rounded-md">
                        {doctors.map((doctor) => (
                          <li
                            key={doctor.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              form.setValue("doctorId", doctor.id);
                              setSearchQuery(doctor.name);
                              setDoctors([]);
                            }}
                          >
                            <div>{doctor.name}</div>
                            <div className="text-sm text-gray-500">
                              {doctor.specialization}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <FormDescription>
                      Search for a doctor by name or specialization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                              {week.charAt(0) + week.slice(1).toLowerCase()}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
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
                        <Input type="time" {...field} />
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
                        type="number"
                        {...field}
                        min={0}
                        max={10000}
                        step={50}
                      />
                    </FormControl>
                    <FormDescription>
                      Set the consultation fees between ₹0 and ₹10,000
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="slotDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slot Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          min={5}
                          max={60}
                          step={5}
                        />
                      </FormControl>
                      <FormDescription>
                        Duration of each appointment slot
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxSlots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Slots</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={1} max={50} />
                      </FormControl>
                      <FormDescription>
                        Maximum appointments per session
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !form.formState.isValid ||
                  Object.values(form.getValues()).some((value) => value === "")
                }
                onClick={() => {
                  console.log(
                    "Form values before submission:",
                    form.getValues()
                  );
                  if (!form.formState.isValid) {
                    console.log("Form errors:", form.formState.errors);
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Chamber...
                  </>
                ) : (
                  "Create Chamber"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
