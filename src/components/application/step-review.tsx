"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Check, AlertCircle, FileText, User, GraduationCap, Users, FileCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { getApplicationById } from "@/app/actions/application-actions"
import { Badge } from "@/components/ui/badge"

interface ApplicationStepReviewProps {
  application: any
  onComplete: () => void
}

export function ApplicationStepReview({ application: initialApplication, onComplete }: ApplicationStepReviewProps) {
  const [application, setApplication] = useState(initialApplication)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const refreshApplication = async () => {
      try {
        setIsLoading(true)
        const refreshedApplication = await getApplicationById(initialApplication.id)
        setApplication(refreshedApplication)
      } catch (error) {
        console.error("Error refreshing application data:", error)
        setError("Failed to load the latest application data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    refreshApplication()
  }, [initialApplication.id])

  const handleContinue = () => {
    onComplete()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading application data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const applicant = application?.applicant
  const program = application?.program
  const intake = application?.intake

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review Your Application</h2>
        <p className="text-muted-foreground">
          Please review your application details before submitting. You can go back to any section to make changes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-lg overflow-hidden">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Full Name:</dt>
                <dd className="font-medium">
                  {applicant?.firstName} {applicant?.middleName} {applicant?.surname}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Date of Birth:</dt>
                <dd className="font-medium">
                  {applicant?.dateOfBirth ? formatDate(applicant.dateOfBirth) : "Not provided"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Gender:</dt>
                <dd className="font-medium">{applicant?.gender || "Not provided"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Nationality:</dt>
                <dd className="font-medium">{applicant?.nationality || "Not provided"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Physical Address:</dt>
                <dd className="font-medium">{applicant?.physicalAddress || "Not provided"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Phone Number:</dt>
                <dd className="font-medium">{applicant?.phone || "Not provided"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="rounded-lg overflow-hidden">
          <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Program Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Program:</dt>
                <dd className="font-medium">{program?.title || "Not selected"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Program Type:</dt>
                <dd className="font-medium">
                  {application?.isShortCourse
                    ? `Short Course (${application.shortCourseDuration})`
                    : program?.type || "Not specified"}
                </dd>
              </div>
              {!application?.isShortCourse && intake && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Intake:</dt>
                  <dd className="font-medium">{intake.name}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Application Date:</dt>
                <dd className="font-medium">{formatDate(application?.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status:</dt>
                <dd>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-md"
                  >
                    Draft
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="rounded-lg overflow-hidden">
          <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Sponsor & Next of Kin</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Sponsor Information</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="font-medium">{applicant?.sponsorName || "Not provided"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Relationship:</dt>
                    <dd className="font-medium">{applicant?.sponsorRelationship || "Not provided"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Occupation:</dt>
                    <dd className="font-medium">{applicant?.sponsorOccupation || "Not provided"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Phone:</dt>
                    <dd className="font-medium">{applicant?.sponsorPhone || "Not provided"}</dd>
                  </div>
                </dl>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Next of Kin Information</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="font-medium">{applicant?.nextOfKinName || "Not provided"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Relationship:</dt>
                    <dd className="font-medium">{applicant?.nextOfKinRelationship || "Not provided"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Occupation:</dt>
                    <dd className="font-medium">{applicant?.nextOfKinOccupation || "Not provided"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Phone:</dt>
                    <dd className="font-medium">{applicant?.nextOfKinPhone || "Not provided"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg overflow-hidden">
          <CardHeader className="bg-purple-50/50 dark:bg-purple-950/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Education & Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Education History</h4>
                {applicant?.educationHistory && applicant.educationHistory.length > 0 ? (
                  <div className="space-y-2">
                    {applicant.educationHistory.map((edu: any, index: number) => (
                      <div key={edu.id} className="border rounded-md p-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{edu.institutionName}</span>
                          <span className="text-sm text-muted-foreground">
                            {edu.startYear} - {edu.endYear || "Present"}
                          </span>
                        </div>
                        <div className="text-sm">{edu.qualification}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No education history provided</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Uploaded Documents</h4>
                {application?.documents && application.documents.length > 0 ? (
                  <div className="space-y-2">
                    {application.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between">
                        <span>{doc.name}</span>
                        <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents uploaded</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <FileCheck className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Application Checklist</h3>
        </div>
        <ul className="space-y-2 pl-7 list-disc">
          <li
            className={
              application.personalInfoComplete ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            }
          >
            Personal information {application.personalInfoComplete ? "✓" : ""}
          </li>
          <li
            className={
              application.educationComplete ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            }
          >
            Education history {application.educationComplete ? "✓" : ""}
          </li>
          <li
            className={
              application.programInfoComplete ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            }
          >
            Sponsor and next of kin information {application.programInfoComplete ? "✓" : ""}
          </li>
          <li
            className={
              application.documentsComplete ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            }
          >
            Required documents {application.documentsComplete ? "✓" : ""}
          </li>
        </ul>
      </div>

      <Button onClick={handleContinue} className="rounded-lg bg-blue-600 hover:bg-blue-700">
        Continue to Declaration
      </Button>
    </div>
  )
}
