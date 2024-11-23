// @ts-nocheck
"use client";

import { useState } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format")
    .refine(
      (endTime, ctx) => {
        const start = ctx.parent.startTime;
        if (!start) return true;
        return endTime > start;
      },
      {
        message: "End time must be after start time",
      }
    ),
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
  const [open, setOpen] = useState(false);
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
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setDoctors(data.doctors || []);
    } catch (error) {
      toast.error("Failed to search doctors");
    } finally {
      setSearchLoading(false);
    }
  };

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

      toast.success("Chamber created successfully!");
      router.push("/dashboard/chambers");
    } catch (error) {
      toast.error("Failed to create chamber");
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Doctor</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? doctors.find(
                                  (doctor) => doctor.id === field.value
                                )?.name
                              : "Select a doctor"}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search doctors..."
                            value={searchQuery}
                            onValueChange={searchDoctors}
                          />
                          <CommandEmpty>
                            {searchQuery.length > 0
                              ? "No doctors found"
                              : "Type to search doctors"}
                          </CommandEmpty>
                          <CommandGroup>
                            {searchLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              doctors.map((doctor) => (
                                <CommandItem
                                  key={doctor.id}
                                  value={doctor.name}
                                  onSelect={() => {
                                    form.setValue("doctorId", doctor.id);
                                    setSearchQuery(doctor.name);
                                    setOpen(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span>{doctor.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {doctor.specialization}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))
                            )}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
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

              <Button type="submit" className="w-full" disabled={loading}>
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
