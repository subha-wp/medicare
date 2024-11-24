// @ts-nocheck
// lib/auth.ts
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import prisma from "./prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // Set attributes explicitly for production
    attributes: {
      // Secure in production, allows HTTP in development
      secure: process.env.NODE_ENV === "production",
      // Strict same-site policy
      sameSite: "strict",
      // HttpOnly for security
      httpOnly: true,
      // Set path
      path: "/",
    },
    // Don't set expires to use session cookies
    expires: false,
  },
  getUserAttributes: (databaseUserAttributes) => {
    return {
      email: databaseUserAttributes.email,
      role: databaseUserAttributes.role,
    };
  },
});

// Declare type for Lucia
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  email: string;
  role: string;
}

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const cookieStore = cookies();
    const sessionId =
      (await cookieStore).get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    try {
      const result = await lucia.validateSession(sessionId);

      // Handle session cookie updates
      if (result.session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        (await cookieStore).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }

      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        (await cookieStore).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }

      return result;
    } catch (error) {
      console.error("Session validation error:", error);
      return {
        user: null,
        session: null,
      };
    }
  }
);
