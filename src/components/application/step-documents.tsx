"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadDocument } from "@/app/actions/application-actions"
import { Loader2, Upload, Check, AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface ApplicationStepDocumentsProps {
  application: any
  user: any
  onComplete: () => void
}

export function ApplicationStepDocuments({ application, user, onComplete }: ApplicationStepDocumentsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = useState<Record<string, "idle" | "uploading" | "success" | "error">>({})
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({})

  // Get existing documents
  const existingDocuments = application?.documents || []

  const requiredDocuments = [
    { id: "national_id", name: "National ID", type: "NATIONAL_ID" },
    { id: "passport_photo", name: "Passport Photo (White Background)", type: "PASSPORT_PHOTO" },
    { id: "ple", name: "PLE Certificate", type: "PLE_CERTIFICATE" },
    { id: "uce", name: "UCE Certificate", type: "UCE_CERTIFICATE" },
    { id: "uace", name: "UACE Certificate (if applicable)", type: "UACE_CERTIFICATE", optional: true },
    { id: "other", name: "Other Relevant Certificates (if applicable)", type: "OTHER_CERTIFICATE", optional: true },
  ]

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, docType: string, docName: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      setUploadStatus((prev) => ({ ...prev, [docType]: "uploading" }))
      setUploadProgress((prev) => ({ ...prev, [docType]: 0 }))

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const currentProgress = prev[docType] || 0
          if (currentProgress >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, [docType]: currentProgress + 10 }
        })
      }, 300)

      // In a real implementation, you would upload to a storage service like Vercel Blob
      // For now, we'll simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate a successful upload
      const fileUrl = URL.createObjectURL(file)

      // Save document to database
      await uploadDocument(application.id, user.id, {
        name: docName,
        type: docType,
        url: fileUrl, // In production, this would be the URL from your storage service
      })

      clearInterval(progressInterval)
      setUploadProgress((prev) => ({ ...prev, [docType]: 100 }))
      setUploadStatus((prev) => ({ ...prev, [docType]: "success" }))
      setUploadedFiles((prev) => ({ ...prev, [docType]: fileUrl }))

      // Check if all required documents are uploaded
      const allRequiredUploaded = requiredDocuments
        .filter((doc) => !doc.optional)
        .every((doc) => {
          return (
            existingDocuments.some((existingDoc: any) => existingDoc.type === doc.type) ||
            uploadStatus[doc.type] === "success" ||
            uploadedFiles[doc.type]
          )
        })

      if (allRequiredUploaded) {
        onComplete()
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      setUploadStatus((prev) => ({ ...prev, [docType]: "error" }))
      setError(`Failed to upload ${docName}. Please try again.`)
    }
  }

  const isDocumentUploaded = (docType: string) => {
    return existingDocuments.some((doc: any) => doc.type === docType) || uploadStatus[docType] === "success"
  }

  const getDocumentStatus = (docType: string) => {
    if (existingDocuments.some((doc: any) => doc.type === docType)) {
      return "success"
    }
    return uploadStatus[docType] || "idle"
  }

  const areAllRequiredDocumentsUploaded = () => {
    return requiredDocuments.filter((doc) => !doc.optional).every((doc) => isDocumentUploaded(doc.type))
  }

  const handleSubmit = () => {
    if (areAllRequiredDocumentsUploaded()) {
      onComplete()
    } else {
      setError("Please upload all required documents before continuing.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Required Documents</h2>
        <p className="text-muted-foreground">
          Please upload copies of your required documents. All documents should be clear and legible.
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
          const docStatus = getDocumentStatus(doc.type)
          const progress = uploadProgress[doc.type] || 0

          return (
            <Card key={doc.id} className="rounded-lg overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{doc.name}</CardTitle>
                <CardDescription>{doc.optional ? "Optional document" : "Required document"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {docStatus === "success" ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Document uploaded</span>
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  ) : docStatus === "error" ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-destructive">Upload failed</span>
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <X className="h-4 w-4" />
                      </div>
                    </div>
                  ) : docStatus === "uploading" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                        <span className="text-sm font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <label htmlFor={`file-${doc.id}`} className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm font-medium">Click to upload</span>
                          <span className="text-xs text-muted-foreground">PDF, JPG, or PNG</span>
                        </div>
                        <input
                          id={`file-${doc.id}`}
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, doc.type, doc.name)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !areAllRequiredDocumentsUploaded()}
          className="rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Save and Continue"}
        </Button>
      </div>
    </div>
  )
}
