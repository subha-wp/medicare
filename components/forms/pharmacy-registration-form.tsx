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
import { FileUpload } from "@/components/file-upload";
import { LocationInput } from "@/components/location-input";

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

export function PharmacyRegistrationForm({ form }: { form: any }) {
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
        name="profile.businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your business name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your business address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <LocationInput
                onLocationSelect={(location) => {
                  form.setValue("profile.location", location, {
                    shouldValidate: true,
                  });
                }}
              />
            </FormControl>
            {field.value?.latitude !== 0 && (
              <FormDescription>
                Location set: {field.value.latitude.toFixed(6)},{" "}
                {field.value.longitude.toFixed(6)}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.gstin"
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

      <FormField
        control={form.control}
        name="profile.tradeLicense"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trade License Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your trade license number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.documents.tradeLicenseDoc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trade License Document (Optional)</FormLabel>
            <FormDescription>
              You can upload this document later from your dashboard
            </FormDescription>
            <FormControl>
              <FileUpload
                onChange={field.onChange}
                value={field.value || ""}
                label="Trade License"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profile.documents.gstinDoc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GSTIN Document (Optional)</FormLabel>
            <FormDescription>
              You can upload this document later from your dashboard
            </FormDescription>
            <FormControl>
              <FileUpload
                onChange={field.onChange}
                value={field.value || ""}
                label="GSTIN Document"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
