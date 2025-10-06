// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
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
import { ArrowLeft, User, Stethoscope, Pill } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role")?.toUpperCase() ?? "PATIENT") as
    | "PATIENT"
    | "DOCTOR"
    | "PHARMACY";

  const [loading, setLoading] = useState(false);

  // All user types now use the same simplified schema
  const schema = baseSchema.merge(z.object({ profile: patientSchema }));

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      profile: {
        name: "",
        phone: "",
        address: "",
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

  const getRoleIcon = () => {
    switch (role) {
      case "DOCTOR":
        return <Stethoscope className="h-6 w-6" />;
      case "PHARMACY":
        return <Pill className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "DOCTOR":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "PHARMACY":
        return "bg-green-50 text-green-600 border-green-200";
      default:
        return "bg-purple-50 text-purple-600 border-purple-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Image
              src="/bookmychamber.png"
              height={32}
              width={32}
              alt="logo"
              className="rounded-lg"
            />
            <span className="font-semibold text-gray-900">BookMyChamber</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Role Badge */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getRoleColor()} mb-4`}
            >
              {getRoleIcon()}
              <span className="font-medium capitalize">{role.toLowerCase()}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600 text-sm">
              Join BookMyChamber as a {role.toLowerCase()} and start your journey
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <BaseFields form={form} />

                {/* Role-specific fields are now empty since we simplified */}
                <PatientFields form={form} />
                <DoctorFields form={form} />
                <PharmacyFields form={form} />

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{" "}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
