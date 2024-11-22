// @ts-nocheck
"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PatientRegistrationForm } from "@/components/forms/patient-registration-form";
import { DoctorRegistrationForm } from "@/components/forms/doctor-registration-form";
import { PharmacyRegistrationForm } from "@/components/forms/pharmacy-registration-form";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  bloodGroup: z.enum(bloodGroups).optional(),
});

const doctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  specialization: z.string().min(2, "Specialization is required"),
  qualification: z.string().min(2, "Qualification is required"),
  experience: z.coerce.number().min(0, "Experience must be a positive number"),
  about: z.string().optional(),
  licenseNo: z.string().min(1, "License number is required"),
  aadhaarNo: z.string().length(12, "Aadhaar number must be 12 digits"),
  documents: z.object({
    licenseDoc: z.string().optional(),
    aadhaarDoc: z.string().optional(),
  }),
});

const pharmacySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  gstin: z.string().optional(),
  tradeLicense: z.string().min(1, "Trade license is required"),
  documents: z.object({
    tradeLicenseDoc: z.string().optional(),
    gstinDoc: z.string().optional(),
    otherDocs: z.array(z.string()).optional(),
  }),
});

const baseSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role")?.toUpperCase() || "PATIENT";
  const [loading, setLoading] = useState(false);

  let schema;
  switch (role) {
    case "DOCTOR":
      schema = baseSchema.extend({ profile: doctorSchema });
      break;
    case "PHARMACY":
      schema = baseSchema.extend({ profile: pharmacySchema });
      break;
    default:
      schema = baseSchema.extend({ profile: patientSchema });
  }

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      profile: {
        name: "",
        phone: "",
        ...(role === "PATIENT" && {
          address: "",
          dateOfBirth: "",
          bloodGroup: undefined,
        }),
        ...(role === "DOCTOR" && {
          specialization: "",
          qualification: "",
          experience: 0,
          about: "",
          licenseNo: "",
          aadhaarNo: "",
          documents: {
            licenseDoc: "",
            aadhaarDoc: "",
          },
        }),
        ...(role === "PHARMACY" && {
          businessName: "",
          address: "",
          location: {
            latitude: 0,
            longitude: 0,
          },
          gstin: "",
          tradeLicense: "",
          documents: {
            tradeLicenseDoc: "",
            gstinDoc: "",
            otherDocs: [],
          },
        }),
      },
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, role }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Registration successful! You can upload documents later.");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Register as {role.toLowerCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === "PATIENT" && <PatientRegistrationForm form={form} />}
              {role === "DOCTOR" && <DoctorRegistrationForm form={form} />}
              {role === "PHARMACY" && <PharmacyRegistrationForm form={form} />}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline"
                >
                  Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
