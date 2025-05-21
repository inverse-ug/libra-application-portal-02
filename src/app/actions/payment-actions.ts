"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import prisma from "../../lib/prisma";
import { PaymentMethod, PaymentStatus } from "../generated/prisma";

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

    // Check if application is submitted (not in draft)
    if (application.status === "DRAFT") {
      return {
        success: false,
        message:
          "Cannot pay for draft application. Please submit your application first.",
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

    // Map string payment method to enum
    const paymentMethodEnum = mapPaymentMethod(paymentMethod);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: 50000, // Application fee amount
        status: PaymentStatus.COMPLETED,
        method: paymentMethodEnum,
        transactionId: paymentReference,
        paidAt: new Date(),
        application: {
          connect: { id: applicationId },
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
        paymentDate: payment.paidAt,
      },
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    return { success: false, message: "Failed to process payment" };
  }
}

// Helper function to map string payment method to enum
function mapPaymentMethod(method: string): PaymentMethod {
  switch (method.toLowerCase()) {
    case "mtn":
      return PaymentMethod.MTN;
    case "airtel":
      return PaymentMethod.AIRTEL;
    case "card":
      return PaymentMethod.CARD;
    case "bank":
      return PaymentMethod.BANK;
    default:
      return PaymentMethod.MTN; // Default
  }
}
