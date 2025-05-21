"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";
import { DocumentType } from "../generated/prisma";

/**
 * Get user applications
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
      intake: true,
      program: true,
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return applications;
}

/**
 * Get application by ID
 */
export async function getApplicationById(id: string) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      intake: true,
      program: true,
      payment: true,
      documents: true,
      applicant: {
        include: {
          educationHistory: true,
        },
      },
    },
  });

  return application;
}

/**
 * Check if user has an existing application for an intake
 */
export async function checkExistingApplication(
  userId: string,
  intakeId: string | null,
  programId: string
) {
  const where: any = {
    applicantId: userId,
    programId: programId,
  };

  if (intakeId) {
    where.intakeId = intakeId;
  }

  const existingApplication = await prisma.application.findFirst({
    where,
  });

  return existingApplication;
}

/**
 * Create or update application
 */
export async function createOrUpdateApplication(
  userId: string,
  programId: string,
  data: {
    intakeId?: string | null;
    isShortCourse?: boolean;
    shortCourseDuration?: string;
  }
) {
  // Check for existing application
  const existingApplication = await checkExistingApplication(
    userId,
    data.intakeId || null,
    programId
  );

  if (existingApplication) {
    return existingApplication;
  }

  // Create new application
  const newApplication = await prisma.application.create({
    data: {
      applicantId: userId,
      programId: programId,
      intakeId: data.intakeId,
      isShortCourse: data.isShortCourse || false,
      shortCourseDuration: data.shortCourseDuration,
      status: "DRAFT",
      progress: 0,
      completedSteps: [],
      currentStep: "basics", // Set the first step as "basics"
    },
  });

  if (data.intakeId) {
    revalidatePath(`/intakes/${data.intakeId}`);
  }
  revalidatePath(`/programs/${programId}`);
  revalidatePath(`/my-applications`);

  return newApplication;
}

/**
 * Update application basics
 */
export async function updateApplicationBasics(
  applicationId: string,
  data: {
    isShortCourse: boolean;
    intakeId: string | null;
    programId: string;
    shortCourseDuration: string | null;
  }
) {
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      isShortCourse: data.isShortCourse,
      intakeId: data.intakeId,
      programId: data.programId,
      shortCourseDuration: data.shortCourseDuration,
      basicsComplete: true,
    },
    include: {
      program: true,
      intake: true,
    },
  });

  revalidatePath(`/apply/${applicationId}`);

  return application;
}

/**
 * Update application step
 */
export async function updateApplicationStep(
  applicationId: string,
  data: {
    currentStep: string;
    completedSteps: string[];
    progress: number;
    [key: string]: any; // Additional fields to update
  }
) {
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      ...data, // Spread all fields, including currentStep, completedSteps, progress, and any additional fields
    },
  });

  revalidatePath(`/apply/${applicationId}`);
  revalidatePath(`/my-applications`);

  return application;
}

// Add a new function to update the work experience information
export async function updateWorkExperience(
  applicationId: string,
  userId: string,
  data: {
    hasWorkExperience: boolean;
    workExperiences: {
      company: string;
      position: string;
      startDate: Date;
      endDate?: Date | null;
      description: string;
    }[];
  }
) {
  try {
    // First delete existing work experiences for this application
    await prisma.workExperience.deleteMany({
      where: {
        applicationId: applicationId,
      },
    });

    // Add new work experience records if the applicant has work experience
    if (data.hasWorkExperience && data.workExperiences.length > 0) {
      for (const experience of data.workExperiences) {
        await prisma.workExperience.create({
          data: {
            applicationId: applicationId,
            applicantId: userId,
            company: experience.company,
            position: experience.position,
            startDate: experience.startDate,
            endDate: experience.endDate,
            description: experience.description,
          },
        });
      }
    }

    // Update application progress
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        workExperienceComplete: true,
      },
    });

    revalidatePath(`/apply/${applicationId}`);

    return application;
  } catch (error) {
    console.error("Error updating work experience:", error);
    throw error;
  }
}

/**
 * Submit application
 */
export async function submitApplication(applicationId: string) {
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "SUBMITTED",
      progress: 100,
      declarationSigned: true,
      declarationDate: new Date(),
    },
  });

  // Create notification for the applicant
  await prisma.notification.create({
    data: {
      applicantId: application.applicantId,
      title: "Application Submitted",
      message:
        "Your application has been successfully submitted and is now under review.",
      type: "APPLICATION_UPDATE",
    },
  });

  revalidatePath(`/apply/${applicationId}`);
  revalidatePath(`/my-applications`);

  return application;
}

/**
 * Update personal information
 */
export async function updatePersonalInfo(
  applicationId: string,
  userId: string,
  data: {
    firstName: string;
    middleName?: string | null;
    surname: string;
    dateOfBirth: Date | null;
    gender: string | null;
    nationality: string | null;
    physicalAddress: string | null;
  }
) {
  // Update applicant information
  await prisma.applicant.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      middleName: data.middleName,
      surname: data.surname,
      name: `${data.firstName} ${data.middleName || ""} ${data.surname}`.trim(),
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      nationality: data.nationality,
      physicalAddress: data.physicalAddress,
    },
  });

  // Update application progress
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      personalInfoComplete: true,
    },
  });

  revalidatePath(`/apply/${applicationId}`);

  return application;
}

/**
 * Add education history
 */
export async function addEducationHistory(
  applicationId: string,
  userId: string,
  data: {
    records: {
      institutionName: string;
      startYear: number;
      endYear?: number | null;
      qualification: string;
    }[];
  }
) {
  // First delete existing education history for this applicant
  await prisma.educationHistory.deleteMany({
    where: {
      applicantId: userId,
    },
  });

  // Add new education history records
  for (const record of data.records) {
    await prisma.educationHistory.create({
      data: {
        applicantId: userId,
        institutionName: record.institutionName,
        startYear: record.startYear,
        endYear: record.endYear,
        qualification: record.qualification,
      },
    });
  }

  // Update application progress
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      educationComplete: true,
    },
  });

  revalidatePath(`/apply/${applicationId}`);

  return application;
}

/**
 * Update sponsor and next of kin information
 */
export async function updateSponsorAndNextOfKin(
  applicationId: string,
  userId: string,
  data: {
    // Sponsor
    sponsorName: string;
    sponsorRelationship: string;
    sponsorOccupation: string;
    sponsorAddress: string;
    sponsorPhone: string;

    // Next of Kin
    nextOfKinName: string;
    nextOfKinRelationship: string;
    nextOfKinOccupation: string;
    nextOfKinAddress: string;
    nextOfKinPhone: string;
  }
) {
  // Update applicant information
  await prisma.applicant.update({
    where: { id: userId },
    data: {
      sponsorName: data.sponsorName,
      sponsorRelationship: data.sponsorRelationship,
      sponsorOccupation: data.sponsorOccupation,
      sponsorAddress: data.sponsorAddress,
      sponsorPhone: data.sponsorPhone,

      nextOfKinName: data.nextOfKinName,
      nextOfKinRelationship: data.nextOfKinRelationship,
      nextOfKinOccupation: data.nextOfKinOccupation,
      nextOfKinAddress: data.nextOfKinAddress,
      nextOfKinPhone: data.nextOfKinPhone,
    },
  });

  // Update application progress
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      programInfoComplete: true,
    },
  });

  revalidatePath(`/apply/${applicationId}`);

  return application;
}

/**
 * Upload document
 */
export async function uploadDocument(
  applicationId: string,
  userId: string,
  data: {
    name: string;
    type: string;
    url: string;
  }
) {
  try {
    // Add document
    const document = await prisma.document.create({
      data: {
        applicantId: userId,
        applicationId: applicationId,
        name: data.name,
        type: data.type as DocumentType,
        url: data.url,
      },
    });

    // Update application progress
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        documentsComplete: true,
      },
    });

    revalidatePath(`/apply/${applicationId}`);

    return {
      success: true,
      message: "Document uploaded successfully",
      document: document,
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    return {
      success: false,
      message: "Failed to upload document",
    };
  }
}

/**
 * Update declaration
 */
export async function updateDeclaration(
  applicationId: string,
  data: {
    declarationSigned: boolean;
  }
) {
  // Update application
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      declarationSigned: data.declarationSigned,
      declarationDate: new Date(),
      declarationComplete: true,
    },
  });

  revalidatePath(`/apply/${applicationId}`);

  return application;
}
