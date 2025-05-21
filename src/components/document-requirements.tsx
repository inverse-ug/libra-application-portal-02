"use client"

import { useState, useEffect } from "react"
import { FileUpload } from "@/components/file-upload"
import { Badge } from "@/components/ui/badge"
import { Info, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DocumentRequirementsProps {
  scheme: any
  onDocumentsChange: (documents: any[]) => void
  className?: string
}

export function DocumentRequirements({ scheme, onDocumentsChange, className }: DocumentRequirementsProps) {
  const [documents, setDocuments] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState("all")

  // Get document requirements from scheme
  const documentConfig = scheme?.applicationFields?.documents || {}
  const requiresDocuments = documentConfig.requiresDocuments !== "never"

  // Define document types and their requirements
  const documentTypes = [
    {
      id: "transcript",
      name: "Academic Transcript",
      required: documentConfig.requiresTranscript === "required",
      optional: documentConfig.requiresTranscript === "optional",
      description: "Your most recent academic transcript showing grades and courses",
      accept: "application/pdf,image/jpeg,image/png",
    },
    {
      id: "idDocument",
      name: "ID Document",
      required: documentConfig.requiresIDDocument === "required",
      optional: documentConfig.requiresIDDocument === "optional",
      description: "National ID, passport, or other government-issued identification",
      accept: "application/pdf,image/jpeg,image/png",
    },
    {
      id: "passportPhoto",
      name: "Passport Photo",
      required: documentConfig.requiresPassportPhoto === "required",
      optional: documentConfig.requiresPassportPhoto === "optional",
      description: "Recent passport-sized photograph with white background",
      accept: "image/jpeg,image/png",
    },
    {
      id: "recommendationLetter",
      name: "Recommendation Letter",
      required: documentConfig.requiresRecommendationLetter === "required",
      optional: documentConfig.requiresRecommendationLetter === "optional",
      description: "Letter of recommendation from academic or professional reference",
      accept: "application/pdf",
    },
    {
      id: "cv",
      name: "CV/Resume",
      required: documentConfig.requiresCV === "required",
      optional: documentConfig.requiresCV === "optional",
      description: "Your current curriculum vitae or resume",
      accept: "application/pdf",
    },
    {
      id: "oLevelCertificate",
      name: "O' Level Certificate",
      required: documentConfig.requiresOLevelCertificate === "required",
      optional: documentConfig.requiresOLevelCertificate === "optional",
      description: "Your O' Level certificate or equivalent",
      accept: "application/pdf,image/jpeg,image/png",
    },
    {
      id: "aLevelCertificate",
      name: "A' Level Certificate",
      required: documentConfig.requiresALevelCertificate === "required",
      optional: documentConfig.requiresALevelCertificate === "optional",
      description: "Your A' Level certificate or equivalent",
      accept: "application/pdf,image/jpeg,image/png",
    },
    {
      id: "additionalDocuments",
      name: "Additional Documents",
      required: documentConfig.requiresMoreDocuments === "required",
      optional: documentConfig.requiresMoreDocuments === "optional",
      description: "Any additional supporting documents",
      accept: "application/pdf,image/jpeg,image/png",
    },
  ].filter((doc) => doc.required || doc.optional)

  // Filter active documents based on filter
  const filteredDocuments = documentTypes.filter((doc) => {
    if (activeFilter === "all") return true
    if (activeFilter === "required") return doc.required
    if (activeFilter === "optional") return doc.optional
    return false
  })

  // Count required and optional documents
  const requiredCount = documentTypes.filter((doc) => doc.required).length
  const optionalCount = documentTypes.filter((doc) => doc.optional).length

  // Handle document changes
  const handleDocumentChange = (docType: string, files: any[]) => {
    // Update documents state
    setDocuments((prev) => {
      const newDocs = [...prev]
      const existingIndex = newDocs.findIndex((d) => d.type === docType)

      if (existingIndex >= 0) {
        if (files.length === 0) {
          // Remove document type if no files
          newDocs.splice(existingIndex, 1)
        } else {
          // Update existing document type
          newDocs[existingIndex] = { type: docType, files }
        }
      } else if (files.length > 0) {
        // Add new document type
        newDocs.push({ type: docType, files })
      }

      return newDocs
    })
  }

  // Update parent component when documents change
  useEffect(() => {
    onDocumentsChange(documents)
  }, [documents, onDocumentsChange])

  if (!requiresDocuments) {
    return null
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("all")}
        >
          All Documents
          <Badge variant="outline" className="ml-2 bg-background">
            {documentTypes.length}
          </Badge>
        </Button>
        <Button
          variant={activeFilter === "required" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("required")}
        >
          Required
          <Badge variant="outline" className="ml-2 bg-background">
            {requiredCount}
          </Badge>
        </Button>
        <Button
          variant={activeFilter === "optional" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("optional")}
        >
          Optional
          <Badge variant="outline" className="ml-2 bg-background">
            {optionalCount}
          </Badge>
        </Button>
      </div>

      <div className="space-y-6">
        {filteredDocuments.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center border rounded-md border-dashed">
            <div>
              <Info className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No {activeFilter} documents for this application</p>
            </div>
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const docFiles = documents.find((d) => d.type === doc.id)?.files || []
            const isComplete = doc.required ? docFiles.length > 0 : false

            return (
              <div key={doc.id} className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{doc.name}</h3>
                    {doc.required ? (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Optional
                      </Badge>
                    )}

                    {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{doc.description}</p>

                <FileUpload
                  accept={doc.accept}
                  multiple={false}
                  onFilesChange={(files) => handleDocumentChange(doc.id, files)}
                  description={`Upload your ${doc.name}`}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
