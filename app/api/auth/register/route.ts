"use server";

import { lucia } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.json();
  const { email, password, role, profile } = formData;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          email,
          hashedPassword: passwordHash,
          role,
        },
      });

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

    const session = await lucia.createSession(result.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}