"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { patientSchema } from "./schemas";
import { lucia } from "@/lib/auth";
import { applyReferralCode, getOrCreateReferralCode } from "@/lib/referral";

// Simplified registration schema
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["PATIENT", "DOCTOR", "PHARMACY"]),
  profile: patientSchema, // All user types now use the same simplified profile
  referralCode: z.string().optional(),
});

export async function register(formData: FormData) {
  const result = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    profile: JSON.parse(formData.get("profile") as string),
    referralCode: formData.get("referralCode") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password, role, profile, referralCode } = result.data;

  try {
    // Check if user exists with email
    const existingUser = await prisma.user.findFirst({
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
      // Create user
      await tx.user.create({
        data: {
          id: userId,
          email,
          phone: profile.phone || null,
          hashedPassword,
          role,
        },
      });

      // Validate referral code if provided (after user is created)
      let validReferralCode = null;
      if (referralCode) {
        const validation = await applyReferralCode(referralCode, userId, role);
        if (validation.success) {
          validReferralCode = referralCode;
        }
        // Don't fail registration if referral code is invalid, just log it
        if (!validation.success) {
          console.warn("Invalid referral code during registration:", referralCode);
        }
      }

      // Create profile based on role
      switch (role) {
        case "PATIENT":
          const patient = await tx.patient.create({
            data: {
              userId,
              name: profile.name,
              phone: profile.phone || null,
              address: profile.address || null,
            },
          });
          // Store referral code for later use (we'll use it when they book first appointment)
          // For now, we'll track it via a custom field or use it during first booking
          break;
        case "DOCTOR":
          await tx.doctor.create({
            data: {
              userId,
              name: profile.name,
              phone: profile.phone || null,
              address: profile.address || null,
            },
          });
          break;
        case "PHARMACY":
          await tx.pharmacy.create({
            data: {
              userId,
              name: profile.name,
              phone: profile.phone || null,
              address: profile.address || null,
            },
          });
          break;
      }
    });

    // Create referral code for new user
    await getOrCreateReferralCode(userId, role);

    // Create session
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
