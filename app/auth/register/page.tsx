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

const patientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  dateOfBirth: z.string(),
  bloodGroup: z.string().optional(),
});

const doctorSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  specialization: z.string().min(2),
  qualification: z.string().min(2),
  experience: z.number().min(0),
  about: z.string().optional(),
});

const pharmacySchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

const baseSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
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
      profile: {},
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

      toast.success("Registration successful!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register as {role.toLowerCase()}</CardTitle>
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
                      <Input {...field} type="email" />
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
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Profile fields based on role */}
              {/* Add specific fields for each role */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}