import { lucia } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hash } from "@node-rs/argon2";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.json();
  const { email, password, role, profile } = formData;

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

    const result = await prisma.$transaction(async (tx) => {
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
    (await cookies()).set(
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
