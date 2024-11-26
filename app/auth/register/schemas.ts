import { z } from "zod";

export const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const baseProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export const patientSchema = baseProfileSchema.extend({
  dateOfBirth: z
    .string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, "Date must be in DD-MM-YYYY format"),
  bloodGroup: z.enum(bloodGroups).optional(),
});

export const doctorSchema = baseProfileSchema.extend({
  specialization: z.string().min(2, "Specialization is required"),
  qualification: z.string().min(2, "Qualification is required"),
  experience: z.coerce.number().min(0, "Experience must be a positive number"),
  about: z.string().optional(),
  licenseNo: z.string().min(1, "License number is required"),
  aadhaarNo: z.string().length(12, "Aadhaar number must be 12 digits"),
  documents: z.object({
    licenseDoc: z.string().min(1, "License document is required"),
    aadhaarDoc: z.string().min(1, "Aadhaar document is required"),
  }),
});

export const pharmacySchema = baseProfileSchema.extend({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  gstin: z.string().optional(),
  tradeLicense: z.string().min(1, "Trade license is required"),
  documents: z.object({
    tradeLicenseDoc: z.string().min(1, "Trade license document is required"),
    gstinDoc: z.string().optional(),
  }),
});

export const baseSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
