import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateRequest } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { user } = await validateRequest();
  const path = request.nextUrl.pathname;

  if (!user && !path.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (user && path.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
