import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth"; // Import the auth function from NextAuth

const publicRoutes = [
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
];

const authRedirectRoutes = [
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
];

// Wrap your middleware with the auth function
export default auth(async function middleware(request) {
  const { pathname } = request.nextUrl;
  const session = request.auth; // Get session from req.auth

  const isAuthenticated = !!session;

  if (
    isAuthenticated &&
    authRedirectRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    !isAuthenticated &&
    !publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
