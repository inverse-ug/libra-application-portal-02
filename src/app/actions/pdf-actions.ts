"use server";

import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";

export async function generateApplicationPDF(applicationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, message: "Unauthorized" };
    }

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

    if (application.applicant.email !== session.user.email) {
      return {
        success: false,
        message:
          "Unauthorized - You don't have permission to access this application",
      };
    }

    // Return the URL to the PDF endpoint
    const pdfUrl = `/api/pdf/${applicationId}`;

    return {
      success: true,
      message: "PDF generated successfully",
      url: pdfUrl,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, message: "Failed to generate PDF" };
  }
}

export async function printApplication(applicationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, message: "Unauthorized" };
    }

    // Get application with all related data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        applicant: true,
      },
    });

    if (!application) {
      return { success: false, message: "Application not found" };
    }

    if (application.applicant.email !== session.user.email) {
      return {
        success: false,
        message:
          "Unauthorized - You don't have permission to access this application",
      };
    }

    // Return success - the actual printing will be handled client-side
    return {
      success: true,
      message: "Print request processed",
    };
  } catch (error) {
    console.error("Error processing print request:", error);
    return { success: false, message: "Failed to process print request" };
  }
}
