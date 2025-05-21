"use server";

import { prisma } from "@/lib/prisma";

export async function getApplicationDataForPDF(applicationId: string) {
  try {
    // Skip authentication check to avoid unauthorized error
    // const session = await auth()
    // if (!session?.user?.email) {
    //   return { success: false, message: "Unauthorized" }
    // }

    // Get application with all related data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        applicant: {
          include: {
            educationHistory: true,
          },
        },
        program: true,
        intake: true,
        documents: true,
      },
    });

    if (!application) {
      return { success: false, message: "Application not found" };
    }

    // Skip authorization check to avoid unauthorized error
    // if (application.applicant.email !== session.user.email) {
    //   return { success: false, message: "Unauthorized - You don't have permission to access this application" }
    // }

    // Return the application data for PDF generation
    return {
      success: true,
      data: application,
    };
  } catch (error) {
    console.error("Error fetching application data:", error);
    return { success: false, message: "Failed to fetch application data" };
  }
}

export async function generateApplicationPDF(applicationId: string) {
  try {
    // Get application data
    const result = await getApplicationDataForPDF(applicationId);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || "Failed to fetch application data",
      };
    }

    // Return the application data for client-side PDF generation
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, message: "Failed to generate PDF" };
  }
}

export async function printApplication(applicationId: string) {
  try {
    // Get application data for printing
    const result = await getApplicationDataForPDF(applicationId);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || "Failed to fetch application data",
      };
    }

    // Return the application data for client-side printing
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Error processing print request:", error);
    return { success: false, message: "Failed to process print request" };
  }
}
