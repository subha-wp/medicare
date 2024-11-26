// @ts-nocheck
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import prisma from "./prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // Remove expires: false as it might be causing issues
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  },
  getUserAttributes: (databaseUserAttributes) => {
    return {
      email: databaseUserAttributes.email,
      role: databaseUserAttributes.role,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
  interface DatabaseUserAttributes {
    email: string;
    role: "PATIENT" | "DOCTOR" | "PHARMACY";
  }
  interface User {
    email: string;
    role: "PATIENT" | "DOCTOR" | "PHARMACY";
  }
}

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const cookieStore = cookies();
    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    try {
      const { session, user } = await lucia.validateSession(sessionId);

      if (session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }

      if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }

      return {
        user,
        session,
      };
    } catch (e) {
      console.error("Session validation error:", e);
      return {
        user: null,
        session: null,
      };
    }
  }
);
