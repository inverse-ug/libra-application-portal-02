"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "../../auth";

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

import { redirect } from "next/navigation";

/**
 * Download admission letter as PDF
 */
export async function downloadAdmissionLetter(applicationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
        applicantId: session.user.id,
        status: "ACCEPTED",
      },
      include: {
        applicant: true,
        program: {
          include: {
            categories: true,
          },
        },
        intake: true,
        admission: true,
      },
    });

    if (!application) {
      throw new Error("Application not found or access denied");
    }

    // If no admission record exists, create one
    let admission = application.admission;
    if (!admission) {
      const admissionCount = await prisma.admission.count();
      const admissionNumber = `ADM/${new Date().getFullYear()}/${String(admissionCount + 1).padStart(4, "0")}`;

      admission = await prisma.admission.create({
        data: {
          applicantId: application.applicantId,
          programId: application.programId,
          applicationId: application.id,
          admissionNumber,
          startDate: application.intake?.startDate || new Date(),
          status: "PROVISIONAL",
        },
      });
    }

    // Redirect to admission letter page for PDF generation
    redirect(`/application-history/${applicationId}/admission-letter`);
  } catch (error) {
    console.error("Error downloading admission letter:", error);
    throw new Error("Failed to download admission letter");
  }
}

/**
 * Get detailed application for admission letter
 */
export async function getApplicationForAdmissionLetter(applicationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
        applicantId: session.user.id,
        status: "ACCEPTED",
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            middleName: true,
            surname: true,
            dateOfBirth: true,
            gender: true,
            nationality: true,
            physicalAddress: true,
            phone: true,
          },
        },
        program: {
          include: {
            categories: true,
          },
        },
        intake: true,
        admission: true,
        payment: true,
      },
    });

    if (!application) {
      return null;
    }

    // Ensure admission record exists
    let admission = application.admission;
    if (!admission) {
      const admissionCount = await prisma.admission.count();
      const admissionNumber = `ADM/${new Date().getFullYear()}/${String(admissionCount + 1).padStart(4, "0")}`;

      admission = await prisma.admission.create({
        data: {
          applicantId: application.applicantId,
          programId: application.programId,
          applicationId: application.id,
          admissionNumber,
          startDate: application.intake?.startDate || new Date(),
          status: "PROVISIONAL",
        },
      });

      // Update the application object with the new admission
      application.admission = admission;
    }

    return application;
  } catch (error) {
    console.error("Error getting application for admission letter:", error);
    return null;
  }
}
