"use server";

import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

export async function logout() {
  const cookieStore = cookies();
  const sessionId =
    (await cookieStore).get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return { error: "No session" };
  }

  await lucia.invalidateSession(sessionId);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookieStore).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return { success: true };
}
