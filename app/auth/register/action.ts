//@ts-nocheck
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { patientSchema, doctorSchema, pharmacySchema } from "./schemas";
import { lucia } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["PATIENT", "DOCTOR", "PHARMACY"]),
  profile: z.union([patientSchema, doctorSchema, pharmacySchema]),
});

export async function register(formData: FormData) {
  const result = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    profile: JSON.parse(formData.get("profile") as string),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password, role, profile } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email already registered" };
    }

    const hashedPassword = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          email,
          hashedPassword,
          role,
        },
      });

      switch (role) {
        case "PATIENT":
          await tx.patient.create({
            data: {
              userId,
              ...profile,
              dateOfBirth: new Date(
                profile.dateOfBirth.split("-").reverse().join("-")
              ),
            },
          });
          break;
        case "DOCTOR":
          await tx.doctor.create({
            data: {
              userId,
              ...profile,
              documents: JSON.stringify(profile.documents),
            },
          });
          break;
        case "PHARMACY":
          await tx.pharmacy.create({
            data: {
              userId,
              ...profile,
              location: JSON.stringify(profile.location),
              documents: JSON.stringify(profile.documents),
            },
          });
          break;
      }
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      error: "An error occurred during registration. Please try again.",
    };
  }
}
