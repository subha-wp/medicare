"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";

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

export function DoctorRegistrationForm({ form }: { form: any }) {
  return (
    <>
      <FormField
        control={form.control}
        name="profile.name"
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
        name="profile.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="tel"
                placeholder="Enter your phone number"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.specialization"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Specialization</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your specialization" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.qualification"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qualification</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your qualification" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years of Experience</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                min="0"
                placeholder="Enter years of experience"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.about"
        render={({ field }) => (
          <FormItem>
            <FormLabel>About</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Tell us about yourself" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.licenseNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Medical License Number</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter your medical license number"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.aadhaarNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Aadhaar Number</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter your 12-digit Aadhaar number"
                maxLength={12}
                pattern="\d*"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.documents.licenseDoc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Medical License Document</FormLabel>
            <FormDescription>
              Upload a clear scan or photo of your medical license
            </FormDescription>
            <FormControl>
              <FileUpload
                onChange={field.onChange}
                value={field.value || ""}
                label="Medical License"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.documents.aadhaarDoc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Aadhaar Card Document</FormLabel>
            <FormDescription>
              Upload a clear scan or photo of your Aadhaar card
            </FormDescription>
            <FormControl>
              <FileUpload
                onChange={field.onChange}
                value={field.value || ""}
                label="Aadhaar Card"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
