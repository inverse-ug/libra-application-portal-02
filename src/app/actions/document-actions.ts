"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import { put, del } from "@vercel/blob";
import { DocumentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Upload a document to Vercel Blob and save to database
 */
export async function uploadDocumentWithBlob(formData: FormData) {
  try {
    // Get session
    const session = await auth();

    // Log authentication details for debugging
    console.log("Auth session:", session ? "Session exists" : "No session");
    console.log("User email:", session?.user?.email || "No email");
    console.log("User ID:", session?.user?.id || "No ID");

    // Skip authentication check for now to debug the issue
    // if (!session?.user?.email) {
    //   return { success: false, message: "Unauthorized" }
    // }

    const file = formData.get("file") as File;
    const applicationId = formData.get("applicationId") as string;
    const userId = formData.get("userId") as string;
    const documentType = formData.get("documentType") as string;
    const documentName = formData.get("documentName") as string;

    // Log received data
    console.log("Received form data:", {
      fileExists: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      applicationId,
      userId,
      documentType,
      documentName,
    });

    if (!file || !applicationId || !userId || !documentType) {
      return { success: false, message: "Missing required fields" };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        message: "File size exceeds the maximum limit of 5MB",
      };
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: "Invalid file type. Only PDF, JPEG, and PNG files are allowed",
      };
    }

    // Generate a unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `${userId}-${documentType}-${Date.now()}.${fileExtension}`;

    try {
      // Upload file to Vercel Blob
      console.log("Uploading to Vercel Blob...");
      const blob = await put(uniqueFilename, file, {
        access: "public",
      });
      console.log("Blob upload successful:", blob.url);

      // Convert string to DocumentType enum
      // This assumes the string values match the enum values in your Prisma schema
      const docType = documentType as DocumentType;

      // Save document to database
      console.log("Creating document in database...");
      const document = await prisma.document.create({
        data: {
          name: documentName || documentType,
          type: docType,
          url: blob.url,
          applicant: { connect: { id: userId } },
          application: { connect: { id: applicationId } },
        },
      });
      console.log("Document created successfully:", document.id);

      // Revalidate paths
      revalidatePath(`/apply/${applicationId}`);
      revalidatePath(`/my-applications/${applicationId}`);

      return {
        success: true,
        document,
        message: "Document uploaded successfully",
      };
    } catch (innerError) {
      console.error("Inner operation failed:", innerError);
      return {
        success: false,
        message: `Operation failed: ${innerError instanceof Error ? innerError.message : String(innerError)}`,
      };
    }
  } catch (error) {
    console.error("Error in uploadDocumentWithBlob:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to upload document",
    };
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, message: "Unauthorized" };
    }

    // Get document with applicant to verify ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        applicant: true,
        application: true,
      },
    });

    if (!document) {
      return { success: false, message: "Document not found" };
    }

    if (document.applicant.email !== session.user.email) {
      return { success: false, message: "Unauthorized" };
    }

    // Delete the file from Vercel Blob storage
    if (document.url && document.url.includes("blob.vercel-storage.com")) {
      try {
        await del(document.url);
      } catch (error) {
        console.error("Error deleting from Vercel Blob:", error);
        // Continue with database deletion even if blob deletion fails
      }
    }

    // Delete document from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    // Revalidate paths
    if (document.applicationId) {
      revalidatePath(`/apply/${document.applicationId}`);
      revalidatePath(`/my-applications/${document.applicationId}`);
    }

    return { success: true, message: "Document deleted successfully" };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, message: "Failed to delete document" };
  }
}
