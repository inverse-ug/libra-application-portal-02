"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Upload,
  Check,
  AlertCircle,
  X,
  Trash,
  FileText,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  uploadDocumentWithBlob,
  deleteDocument,
} from "@/app/actions/document-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ApplicationStepDocumentsProps {
  application: any;
  user: any;
  onComplete: () => void;
}

export function ApplicationStepDocuments({
  application,
  user,
  onComplete,
}: ApplicationStepDocumentsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [uploadStatus, setUploadStatus] = useState<
    Record<string, "idle" | "uploading" | "success" | "error">
  >({});
  const [existingDocuments, setExistingDocuments] = useState<any[]>(
    application?.documents || []
  );
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Get existing documents
  useEffect(() => {
    setExistingDocuments(application?.documents || []);
  }, [application?.documents]);

  const requiredDocuments = [
    { id: "national_id", name: "National ID", type: "NATIONAL_ID" },
    {
      id: "passport_photo",
      name: "Passport Photo (White Background)",
      type: "PASSPORT_PHOTO",
    },
    { id: "ple", name: "PLE Certificate", type: "PLE_CERTIFICATE" },
    { id: "uce", name: "UCE Certificate", type: "UCE_CERTIFICATE" },
    {
      id: "uace",
      name: "UACE Certificate (if applicable)",
      type: "UACE_CERTIFICATE",
      optional: true,
    },
    {
      id: "other",
      name: "Other Relevant Certificates (if applicable)",
      type: "OTHER_CERTIFICATE",
      optional: true,
    },
  ];

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    docType: string,
    docName: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setUploadStatus((prev) => ({ ...prev, [docType]: "uploading" }));
      setUploadProgress((prev) => ({ ...prev, [docType]: 0 }));

      // Start progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const currentProgress = prev[docType] || 0;
          if (currentProgress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [docType]: currentProgress + 10 };
        });
      }, 300);

      // Create form data for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", application.id);
      formData.append("userId", user.id);
      formData.append("documentType", docType);
      formData.append("documentName", docName);

      clearInterval(progressInterval);

      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }

      setUploadProgress((prev) => ({ ...prev, [docType]: 100 }));
      setUploadStatus((prev) => ({ ...prev, [docType]: "success" }));

      // Update existing documents
      if (result.document) {
        setExistingDocuments((prev) => [...prev, result.document]);
      }

      toast.success(`${docName} uploaded successfully`);
    } catch (error: any) {
      console.error("Error uploading document:", error);
      setUploadStatus((prev) => ({ ...prev, [docType]: "error" }));
      setError(
        error.message || `Failed to upload ${docName}. Please try again.`
      );
      toast.error(error.message || `Failed to upload ${docName}`);

      // Reset file input
      if (fileInputRefs.current[docType]) {
        fileInputRefs.current[docType]!.value = "";
      }
    }
  };

  const handleDeleteDocument = async (
    documentId: string,
    documentName: string
  ) => {
    try {
      setIsDeleting((prev) => ({ ...prev, [documentId]: true }));

      // Delete document from database and Vercel Blob storage
      const result = await deleteDocument(documentId);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Update UI
      setExistingDocuments((prev) =>
        prev.filter((doc) => doc.id !== documentId)
      );
      toast.success(`${documentName} deleted successfully`);
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error(error.message || `Failed to delete ${documentName}`);
    } finally {
      setIsDeleting((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  const handlePreviewDocument = (document: { url: string; name: string }) => {
    setPreviewDocument(document);
  };

  const isDocumentUploaded = (docType: string) => {
    return (
      existingDocuments.some((doc: any) => doc.type === docType) ||
      uploadStatus[docType] === "success"
    );
  };

  const getDocumentStatus = (docType: string) => {
    if (existingDocuments.some((doc: any) => doc.type === docType)) {
      return "success";
    }
    return uploadStatus[docType] || "idle";
  };

  const getDocumentById = (docType: string) => {
    return existingDocuments.find((doc: any) => doc.type === docType);
  };

  const handleSubmit = () => {
    // Document upload is optional, so we can proceed regardless
    onComplete();
  };

  const handleSkip = () => {
    // Allow skipping document upload
    onComplete();
  };

  const renderPreview = () => {
    if (!previewDocument) return null;

    const isImage = previewDocument.url.match(/\.(jpeg|jpg|png|gif)$/i);
    const isPdf = previewDocument.url.match(/\.pdf$/i);

    return (
      <Dialog
        open={!!previewDocument}
        onOpenChange={() => setPreviewDocument(null)}>
        <DialogContent className="sm:max-w-3xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {previewDocument.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[70vh] overflow-auto">
            {isImage ? (
              <img
                src={previewDocument.url || "/placeholder.svg"}
                alt={previewDocument.name}
                className="max-w-full h-auto mx-auto rounded-md"
              />
            ) : isPdf ? (
              <iframe
                src={`${previewDocument.url}#toolbar=0`}
                className="w-full h-[70vh] rounded-md"
                title={previewDocument.name}
              />
            ) : (
              <div className="p-4 text-center">
                <p>Preview not available for this file type.</p>
                <Button asChild className="mt-4">
                  <a
                    href={previewDocument.url}
                    target="_blank"
                    rel="noopener noreferrer">
                    Download File
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Required Documents</h2>
        <p className="text-muted-foreground">
          Please upload copies of your required documents. All documents should
          be clear and legible. You can skip this step and come back later if
          needed.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requiredDocuments.map((doc) => {
          const docStatus = getDocumentStatus(doc.type);
          const progress = uploadProgress[doc.type] || 0;
          const existingDoc = getDocumentById(doc.type);

          return (
            <Card key={doc.id} className="rounded-lg overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{doc.name}</CardTitle>
                <CardDescription>
                  {doc.optional ? "Optional document" : "Required document"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {docStatus === "success" ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Document uploaded
                      </span>
                      <div className="flex items-center gap-2">
                        {existingDoc && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-500"
                              onClick={() =>
                                handlePreviewDocument({
                                  url: existingDoc.url,
                                  name: doc.name,
                                })
                              }>
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500"
                              onClick={() =>
                                handleDeleteDocument(existingDoc.id, doc.name)
                              }
                              disabled={isDeleting[existingDoc.id]}>
                              {isDeleting[existingDoc.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ) : docStatus === "error" ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-destructive">
                        Upload failed
                      </span>
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <X className="h-4 w-4" />
                      </div>
                    </div>
                  ) : docStatus === "uploading" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Uploading...
                        </span>
                        <span className="text-sm font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <label
                        htmlFor={`file-${doc.id}`}
                        className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Click to upload
                          </span>
                          <span className="text-xs text-muted-foreground">
                            PDF, JPG, or PNG (max 5MB)
                          </span>
                        </div>
                        <input
                          id={`file-${doc.id}`}
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileChange(e, doc.type, doc.name)
                          }
                          ref={(el) => {
                            fileInputRefs.current[doc.type] = el;
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="pt-4 flex justify-between">
        <Button variant="outline" onClick={handleSkip} className="rounded-lg">
          Skip for Now
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 hover:bg-blue-700">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Save and Continue"}
        </Button>
      </div>

      {renderPreview()}
    </div>
  );
}
