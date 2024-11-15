import { lucia } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.json();
  const { email, password, role, profile } = formData;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await new Argon2id().hash(password);

    // Create user and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          hashedPassword,
          role,
        },
      });

      // Create profile based on role
      switch (role) {
        case "PATIENT":
          await tx.patient.create({
            data: {
              userId: user.id,
              ...profile,
            },
          });
          break;
        case "DOCTOR":
          await tx.doctor.create({
            data: {
              userId: user.id,
              ...profile,
            },
          });
          break;
        case "PHARMACY":
          await tx.pharmacy.create({
            data: {
              userId: user.id,
              ...profile,
            },
          });
          break;
      }

      return user;
    });

    // Create session
    const session = await lucia.createSession(result.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}