//@ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  baseSchema,
  patientSchema,
  doctorSchema,
  pharmacySchema,
} from "./schemas";
import { BaseFields } from "./components/BaseFields";
import { PatientFields } from "./components/PatientFields";
import { DoctorFields } from "./components/DoctorFields";
import { PharmacyFields } from "./components/PharmacyFields";
import { register } from "./action";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role")?.toUpperCase() ?? "PATIENT") as
    | "PATIENT"
    | "DOCTOR"
    | "PHARMACY";

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
        address: "",
        dateOfBirth: "",
        bloodGroup: undefined,
        specialization: "",
        qualification: "",
        experience: 0,
        about: "",
        licenseNo: "",
        aadhaarNo: "",
        documents: {
          licenseDoc: "",
          aadhaarDoc: "",
          tradeLicenseDoc: "",
          gstinDoc: "",
        },
        businessName: "",
        location: {
          latitude: 0,
          longitude: 0,
        },
        gstin: "",
        tradeLicense: "",
      },
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("role", role);
      formData.append("profile", JSON.stringify(values.profile));

      const result = await register(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("Registration successful!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("Registration error:", error);
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
              <BaseFields form={form} />

              {role === "PATIENT" && <PatientFields form={form} />}
              {role === "DOCTOR" && <DoctorFields form={form} />}
              {role === "PHARMACY" && <PharmacyFields form={form} />}

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
