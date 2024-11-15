import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { lucia } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (!session) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete(lucia.sessionCookieName);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};