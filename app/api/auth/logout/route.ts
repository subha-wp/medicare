import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  const sessionId =
    (await cookieStore).get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  await lucia.invalidateSession(sessionId);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookieStore).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return NextResponse.json({ success: true });
}
