//@ts-nocheck
"use client";

import { useState, useCallback } from "react";
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
import { Loader2, Search } from "lucide-react";
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
  fees: z.coerce.number().min(0, "Fees must be a positive number"),
  slotDuration: z.coerce
    .number()
    .min(5, "Slot duration must be at least 5 minutes"),
  maxSlots: z.coerce.number().min(1, "At least one slot is required"),
});

export default function NewChamberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const form = useForm<z.infer<typeof chamberSchema>>({
    resolver: zodResolver(chamberSchema),
    defaultValues: {
      doctorId: "",
      weekNumber: "FIRST",
      weekDay: "MONDAY",
      startTime: "09:00",
      endTime: "17:00",
      fees: 0,
      slotDuration: 15,
      maxSlots: 1,
    },
  });

  const searchDoctors = useCallback(async (query: string) => {
    setSearchTerm(query);
    if (query.length < 2) {
      setDoctors([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/doctors/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error("Error searching doctors:", error);
      toast.error("Failed to search doctors");
      setDoctors([]);
    }
  }, []);

  async function onSubmit(values: z.infer<typeof chamberSchema>) {
    setLoading(true);
    try {
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
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Chamber</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Doctor</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={`w-full justify-between ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value
                            ? doctors.find(
                                (doctor) => doctor.id === field.value
                              )?.name || "Select doctor"
                            : "Select doctor"}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search doctors..."
                          onValueChange={searchDoctors}
                        />
                        <CommandEmpty>No doctors found.</CommandEmpty>
                        <CommandGroup>
                          {doctors.map((doctor) => (
                            <CommandItem
                              value={doctor.name}
                              key={doctor.id}
                              onSelect={() => {
                                form.setValue("doctorId", doctor.id);
                                setSelectedDoctor(doctor);
                              }}
                            >
                              {doctor.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rest of the form fields remain unchanged */}
            {/* ... */}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Chamber"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
