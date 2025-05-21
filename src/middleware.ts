import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ONLY these routes are public (no auth required)
const publicRoutes = [
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
  // Add other auth-related public routes here
  "/api/auth/", // NextAuth API routes
];

// Routes that authenticated users should be redirected from
const authRedirectRoutes = [
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files & API routes (except auth checks)
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check authentication
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAuthenticated = !!token;

  // CASE 1: User is authenticated but trying to access auth pages
  if (
    isAuthenticated &&
    authRedirectRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    // Redirect to dashboard or home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // CASE 2: User is NOT authenticated and trying to access protected routes
  if (
    !isAuthenticated &&
    !publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    // Redirect to login with callback URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
