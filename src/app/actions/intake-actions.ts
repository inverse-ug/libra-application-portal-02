"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "../../auth";

/**
 * Get all intakes with optional filtering
 */
export async function getIntakes({
  limit,
  isActive,
}: { limit?: number; isActive?: boolean } = {}) {
  const query: any = {};

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  let intakes = await prisma.intake.findMany({
    where: query,
    include: {
      programs: true,
      applications: {
        include: {
          payment: true,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  // Apply limit if specified
  if (limit) {
    intakes = intakes.slice(0, limit);
  }

  return intakes;
}

/**
 * Get a single intake by ID
 */
export async function getIntakeById(id: string) {
  const intake = await prisma.intake.findUnique({
    where: { id },
    include: {
      programs: {
        include: {
          categories: true,
        },
      },
      applications: {
        include: {
          payment: true,
        },
      },
    },
  });

  return intake;
}

/**
 * Get user applications for intakes with proper relations
 */
export async function getUserApplications(userId?: string) {
  if (!userId) {
    const session = await auth();
    userId = session?.user.id;
  }

  if (!userId) return [];

  const applications = await prisma.application.findMany({
    where: {
      applicantId: userId,
    },
    include: {
      intake: {
        include: {
          programs: true,
        },
      },
      program: {
        include: {
          categories: true,
        },
      },
      payment: true,
      admission: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return applications;
}

/**
 * Get announcements from database
 */
export async function getAnnouncements(limit?: number) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isPublished: true,
      },
      include: {
        intake: {
          include: {
            programs: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    // Fallback to mock data if database query fails
    const mockAnnouncements = [
      {
        id: "1",
        title: "Applications Open for January 2025",
        content:
          "Applications for the January 2025 intake are now open. Apply early to secure your spot.",
        createdAt: new Date("2024-10-01"),
        intake: null,
      },
      {
        id: "2",
        title: "New Programs Added",
        content:
          "We've added several new programs to our offerings. Check them out in the programs section.",
        createdAt: new Date("2024-09-15"),
        intake: null,
      },
      {
        id: "3",
        title: "Scholarship Opportunities",
        content:
          "New scholarship opportunities are available for qualified applicants. See the scholarships page for details.",
        createdAt: new Date("2024-09-01"),
        intake: null,
      },
    ];

    return limit ? mockAnnouncements.slice(0, limit) : mockAnnouncements;
  }
}

/**
 * Generate admission letter for an accepted application
 */
export async function generateAdmissionLetter(applicationId: string) {
  try {
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
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
      throw new Error("Application not found or not accepted");
    }

    // Create admission record if it doesn't exist
    let admission = application.admission;
    if (!admission) {
      // Generate admission number
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
        include: {
          applicant: true,
          program: true,
        },
      });
    }

    // Generate PDF content (this is a simplified version)
    const admissionData = {
      admissionNumber: admission.admissionNumber,
      applicantName:
        application.applicant.name ||
        `${application.applicant.firstName || ""} ${application.applicant.surname || ""}`.trim(),
      programTitle: application.program.title,
      intakeName: application.intake?.name || "N/A",
      startDate: application.intake?.startDate?.toLocaleDateString() || "TBD",
      admissionDate: admission.createdAt.toLocaleDateString(),
    };

    return admissionData;
  } catch (error) {
    console.error("Error generating admission letter:", error);
    throw new Error("Failed to generate admission letter");
  }
}

/**
 * Get admission letter data for download
 */
export async function getAdmissionLetterData(applicationId: string) {
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

    return {
      admissionNumber: admission.admissionNumber,
      applicantName:
        application.applicant.name ||
        `${application.applicant.firstName || ""} ${application.applicant.surname || ""}`.trim(),
      programTitle: application.program.title,
      programType: application.program.type,
      programDuration: application.program.duration,
      intakeName: application.intake?.name || "N/A",
      startDate: application.intake?.startDate?.toLocaleDateString() || "TBD",
      endDate: application.intake?.endDate?.toLocaleDateString() || "TBD",
      admissionDate: admission.createdAt.toLocaleDateString(),
      tuitionFee: application.program.tuitionFee,
      applicationId: application.id,
    };
  } catch (error) {
    console.error("Error getting admission letter data:", error);
    throw new Error("Failed to get admission letter data");
  }
}
