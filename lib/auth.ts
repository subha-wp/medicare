// lib/auth.ts
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import prisma from "./prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
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

    const result = await lucia.validateSession(sessionId);

    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        (await cookieStore).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      } else if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        (await cookieStore).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch (error) {
      console.error("Error validating session:", error);
    }

    return result;
  }
);
