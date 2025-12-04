import { z } from "zod";

// Simplified base profile schema with only essential fields
export const baseProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// All user types use the same simplified schema
export const patientSchema = baseProfileSchema;
export const doctorSchema = baseProfileSchema;
export const pharmacySchema = baseProfileSchema;

export const baseSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().optional(),
});
