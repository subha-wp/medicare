// @ts-nocheck
import { lucia } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hash } from "@node-rs/argon2";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["PATIENT", "DOCTOR", "PHARMACY"]),
  profile: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    bloodGroup: z.string().optional(),
    specialization: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.coerce
      .number()
      .min(0, "Experience must be a positive number"),
    about: z.string().optional(),
    licenseNo: z.string().optional(),
    aadhaarNo: z.string().optional(),
    documents: z
      .object({
        licenseDoc: z.string().optional(),
        aadhaarDoc: z.string().optional(),
      })
      .optional(),
    businessName: z.string().optional(),
    location: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
      })
      .optional(),
    gstin: z.string().optional(),
    tradeLicense: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body);

  // const result = userSchema.safeParse(body);

  // if (!result.success) {
  //   return NextResponse.json(
  //     { error: "Invalid input", details: result.error.issues },
  //     { status: 400 }
  //   );
  // }

  const { email, password, role, profile } = body.data;

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

      const dateOfBirth = new Date(profile.dateOfBirth);

      switch (role) {
        case "PATIENT":
          await tx.patient.create({
            data: {
              userId: user.id,
              name: profile.name,
              phone: profile.phone,
              address: profile.address,
              dateOfBirth: dateOfBirth,
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
              specialization: profile.specialization!,
              qualification: profile.qualification!,
              experience: profile.experience!,
              about: profile.about,
              licenseNo: profile.licenseNo!,
              aadhaarNo: profile.aadhaarNo!,
              documents: profile.documents!,
            },
          });
          break;
        case "PHARMACY":
          await tx.pharmacy.create({
            data: {
              userId: user.id,
              name: profile.name,
              businessName: profile.businessName!,
              phone: profile.phone,
              address: profile.address,
              location: profile.location!,
              gstin: profile.gstin,
              tradeLicense: profile.tradeLicense!,
              documents: profile.documents!,
            },
          });
          break;
      }

      return user;
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
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
