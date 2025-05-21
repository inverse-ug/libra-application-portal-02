"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";

interface PaymentData {
  applicationId: string;
  paymentMethod: string;
  phoneNumber?: string;
}

export async function processPayment(data: PaymentData) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, message: "Unauthorized" };
    }

    const { applicationId, paymentMethod, phoneNumber } = data;

    // Get application with applicant
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
      return { success: false, message: "Unauthorized" };
    }

    // Check if application is complete
    if (!application.isComplete) {
      return {
        success: false,
        message: "Cannot pay for incomplete application",
      };
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        applicationId: applicationId,
        status: "COMPLETED",
      },
    });

    if (existingPayment) {
      return {
        success: false,
        message: "Payment already completed for this application",
      };
    }

    // Generate payment reference
    const paymentReference = `PAY-${Date.now().toString(36).toUpperCase()}`;

    // Update application payment status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        paymentStatus: "PAID",
        paymentDate: new Date(),
        paymentMethod,
        paymentReference,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        amount: 50000, // Application fee amount
        currency: "UGX",
        status: "COMPLETED",
        method: paymentMethod,
        reference: paymentReference,
        phoneNumber: phoneNumber || null,
        application: {
          connect: { id: applicationId },
        },
        applicant: {
          connect: { id: application.applicantId },
        },
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/my-applications`);
    revalidatePath(`/my-applications/${applicationId}`);
    revalidatePath(`/payment/${applicationId}`);

    return {
      success: true,
      message: "Payment processed successfully",
      data: {
        paymentReference,
        paymentDate: updatedApplication.paymentDate,
      },
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    return { success: false, message: "Failed to process payment" };
  }
}
