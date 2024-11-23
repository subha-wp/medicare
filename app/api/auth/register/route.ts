// @ts-nocheck
import { lucia } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hash } from "@node-rs/argon2";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const baseProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

const patientProfileSchema = baseProfileSchema.extend({
  dateOfBirth: z
    .string()
    .regex(/^\d{2}-\d{2}-\d{4}$/, "Date must be in DD-MM-YYYY format"),
  bloodGroup: z.enum(bloodGroups).optional(),
});

const doctorProfileSchema = baseProfileSchema.extend({
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

const pharmacyProfileSchema = baseProfileSchema.extend({
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
    tradeLicenseDoc: z.string().optional(),
    gstinDoc: z.string().optional(),
    otherDocs: z.array(z.string()).optional(),
  }),
});

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["PATIENT", "DOCTOR", "PHARMACY"]),
  profile: z.union([
    patientProfileSchema,
    doctorProfileSchema,
    pharmacyProfileSchema,
  ]),
});

function parseDateOfBirth(dateString: string): Date {
  const [day, month, year] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Received body:", body);

  const result = userSchema.safeParse(body);

  if (!result.success) {
    console.error("Validation error:", result.error);
    return NextResponse.json(
      { error: "Invalid input", details: result.error.issues },
      { status: 400 }
    );
  }

  const { email, password, role, profile } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password);
    const userId = generateId(15);

    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          email: email.toLowerCase(),
          hashedPassword,
          role,
        },
      });

      switch (role) {
        case "PATIENT":
          await tx.patient.create({
            data: {
              userId: user.id,
              name: profile.name,
              phone: profile.phone,
              address: profile.address,
              dateOfBirth: parseDateOfBirth(profile.dateOfBirth),
              bloodGroup: profile.bloodGroup,
            },
          });
          break;
        case "DOCTOR":
          await tx.doctor.create({
            data: {
              userId: user.id,
              name: profile.name,
              phone: profile.phone,
              address: profile.address,
              specialization: profile.specialization,
              qualification: profile.qualification,
              experience: profile.experience,
              about: profile.about,
              licenseNo: profile.licenseNo,
              aadhaarNo: profile.aadhaarNo,
              documents: profile.documents,
            },
          });
          break;
        case "PHARMACY":
          await tx.pharmacy.create({
            data: {
              userId: user.id,
              name: profile.name,
              businessName: profile.businessName,
              phone: profile.phone,
              address: profile.address,
              location: profile.location,
              gstin: profile.gstin,
              tradeLicense: profile.tradeLicense,
              documents: profile.documents,
            },
          });
          break;
      }

      return user;
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
