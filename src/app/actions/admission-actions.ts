"use server";

import { auth } from "../../../auth";
import prisma from "../../lib/prisma";

/**
 * Get user admissions
 */
export async function getUserAdmissions(userId?: string) {
  if (!userId) {
    const session = await auth();
    userId = session?.user.id;
  }

  if (!userId) return [];

  const admissions = await prisma.admission.findMany({
    where: {
      applicantId: userId,
    },
    include: {
      program: true,
      application: {
        include: {
          intake: true,
        },
      },
      documents: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return admissions;
}

/**
 * Get admission by ID
 */
export async function getAdmissionById(id: string) {
  const admission = await prisma.admission.findUnique({
    where: { id },
    include: {
      program: true,
      application: {
        include: {
          intake: true,
        },
      },
      documents: true,
      applicant: true,
    },
  });

  return admission;
}

/**
 * Get admission by application ID
 */
export async function getAdmissionByApplicationId(applicationId: string) {
  const admission = await prisma.admission.findUnique({
    where: { applicationId },
    include: {
      program: true,
      application: {
        include: {
          intake: true,
        },
      },
      documents: true,
      applicant: true,
    },
  });

  return admission;
}
