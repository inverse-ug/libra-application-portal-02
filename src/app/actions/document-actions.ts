"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";
import { put, del } from "@vercel/blob";

/**
 * Upload a document to Vercel Blob
 */
export async function uploadDocumentToBlob(file: File, fileName: string) {
  try {
    // Upload file to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    });

    return {
      success: true,
      url: blob.url,
      message: "File uploaded successfully",
    };
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    return {
      success: false,
      message: "Failed to upload file",
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
