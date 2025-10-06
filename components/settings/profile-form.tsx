//@ts-nocheck
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader2, Upload, UserIcon } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

const baseProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  avatarUrl: z.string().optional(),
});

const patientSchema = baseProfileSchema.extend({
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
});

const doctorSchema = baseProfileSchema.extend({
  specialization: z.string().min(2, "Specialization is required"),
  qualification: z.string().min(2, "Qualification is required"),
  experience: z.coerce.number().min(0, "Experience must be a positive number"),
  about: z.string().optional(),
});

const pharmacySchema = baseProfileSchema.extend({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  gstin: z.string().optional(),
});

interface ProfileFormProps {
  userRole: "PATIENT" | "DOCTOR" | "PHARMACY";
  initialData: any;
  iniavatarUrl: string;
}

export function ProfileForm({
  userRole,
  initialData,
  iniavatarUrl,
}: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(iniavatarUrl || "");

  const schema = {
    PATIENT: patientSchema,
    DOCTOR: doctorSchema,
    PHARMACY: pharmacySchema,
  }[userRole];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialData,
      dateOfBirth: initialData.dateOfBirth
        ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
        : undefined,
      avatarUrl: iniavatarUrl || "",
      location: initialData.location || { latitude: 0, longitude: 0 },
    },
  });

  useEffect(() => {
    if (avatarUrl) {
      form.setValue("avatarUrl", avatarUrl);
    }
  }, [avatarUrl, form]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      setLoading(true);

      const dataToSend = {
        ...values,
        avatarUrl,
      };

      // For pharmacy, ensure location is properly formatted
      if (userRole === "PHARMACY") {
        dataToSend.location = initialData.location || {
          latitude: 0,
          longitude: 0,
        };
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Native-style avatar section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="relative inline-block">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-30 h-30 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <div className="mt-4">
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              onSuccess={(result: any) => {
                setAvatarUrl(result.info.secure_url);
              }}
            >
              {({ open }) => {
                return (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => open()}
                    className="w-full max-w-xs"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {avatarUrl ? "Change Photo" : "Add Photo"}
                  </Button>
                );
              }}
            </CldUploadWidget>
            <p className="text-xs text-gray-500 mt-2">
              Recommended: 200x200px
            </p>
          </div>
        </div>
      </div>

      {/* Native-style form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter your full name" 
                        className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter your phone number" 
                        className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter your address" 
                        className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {userRole === "PATIENT" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Date of Birth</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date" 
                          className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Blood Group</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., A+, B-, O+"
                          className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {userRole === "DOCTOR" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Specialization</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Cardiology, Neurology"
                          className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Qualification</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., MBBS, MD, PhD"
                          className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Years of Experience</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min="0" 
                          placeholder="0"
                          className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">About</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell patients about your experience and approach..."
                          className="min-h-[100px] text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {userRole === "PHARMACY" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Business Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your pharmacy name"
                          className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gstin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">GSTIN (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your GSTIN number" 
                          className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 text-base font-medium bg-primary hover:bg-blue-700 text-white rounded-xl"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? "Updating Profile..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
