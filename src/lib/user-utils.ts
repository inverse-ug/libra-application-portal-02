import { notFound } from "next/navigation";
import { Session } from "next-auth";
import { auth } from "../../auth";
import prisma from "../../lib/prisma";

/**
 * Returns the current user's session data
 * @returns Session object containing user information
 * @throws Redirects to login page if no session exists
 */
export async function getSession(): Promise<Session> {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized: No active session");
  }

  return session;
}

/**
 * Returns the current user's basic session information
 * @returns User object from the session
 * @throws Redirects to login page if no session exists
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session.user;
}

/**
 * Returns the complete applicant record from the database
 * @param includeApplications Whether to include the user's applications
 * @returns Full applicant record from database with optional relations
 * @throws Redirects to login page if no session exists or user not found
 */
export async function getCurrentApplicant(includeApplications = false) {
  const session = await getSession();

  const applicant = await prisma.applicant.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      applications: includeApplications
        ? {
            include: {
              program: true,
              intake: true,
              payment: true,
            },
          }
        : false,
    },
  });

  if (!applicant) {
    notFound();
  }

  return applicant;
}

/**
 * Checks if the current user has admin privileges
 * @returns Boolean indicating if user has admin role
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  return user.role === "admin";
}

/**
 * Ensures the current user has admin privileges
 * @throws Error if user is not an admin
 */
export async function requireAdmin() {
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin) {
    throw new Error("Unauthorized: Admin privileges required");
  }

  return true;
}
