"use server";

import { z } from "zod";

import { cookies } from "next/headers";
import { verify } from "@node-rs/argon2";
import { prisma } from "@/lib/db";
import { lucia } from "@/lib/auth";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function login(formData: FormData) {
  const result = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { identifier, password } = result.data;

  try {
    // Check if identifier is email or phone
    const isEmail = identifier.includes("@");
    
    const existingUser = await prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { phone: identifier },
    });

    if (!existingUser) {
      return { error: "Invalid email/phone or password" };
    }

    const validPassword = await verify(existingUser.hashedPassword, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return { error: "Invalid email/phone or password" };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An error occurred during login. Please try again." };
  }
}
