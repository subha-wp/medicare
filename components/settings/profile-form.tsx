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
import { Loader2, Upload } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center space-x-4">
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex items-center space-x-4">
                  {avatarUrl && (
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                  )}
                  <CldUploadWidget
                    uploadPreset={
                      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                    }
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
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {avatarUrl ? "Change Avatar" : "Upload Avatar"}
                        </Button>
                      );
                    }}
                  </CldUploadWidget>
                </div>
                <FormDescription>
                  Upload a profile picture (recommended size: 200x200px)
                </FormDescription>
              </FormItem>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your name" />
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
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your phone number" />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {userRole === "PATIENT" && (
              <>
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
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
                      <FormLabel>Blood Group</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your blood group"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {userRole === "DOCTOR" && (
              <>
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your specialization"
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
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your qualification"
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
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" />
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
                      <FormLabel>About</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell us about yourself"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {userRole === "PHARMACY" && (
              <>
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your business name"
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
                      <FormLabel>GSTIN (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your GSTIN" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
