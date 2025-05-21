"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitApplication } from "@/app/actions/application-actions";
import { Loader2, Check, AlertCircle, FileText, Briefcase } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ApplicationStepReviewProps {
  application: any;
  onComplete: () => void;
}

export function ApplicationStepReview({
  application,
  onComplete,
}: ApplicationStepReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await submitApplication(application.id);
      onComplete();
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd/MM/yyyy");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review Your Application</h2>
        <p className="text-muted-foreground">
          Please review your application details before submitting. Once
          submitted, you will not be able to make changes.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Program Information */}
        <Card className="rounded-lg overflow-hidden">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText className="h-4 w-4" />
              </div>
              Program Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Program</p>
                  <p className="font-medium">
                    {application.program?.title || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">
                    {application.isShortCourse
                      ? `Short Course (${application.shortCourseDuration})`
                      : application.program?.type || "N/A"}
                  </p>
                </div>
                {!application.isShortCourse && (
                  <div>
                    <p className="text-sm text-muted-foreground">Intake</p>
                    <p className="font-medium">
                      {application.intake?.name || "N/A"}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Application Date
                  </p>
                  <p className="font-medium">
                    {formatDate(application.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="rounded-lg overflow-hidden">
          <CardHeader className="bg-green-50/50 dark:bg-green-950/20 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-6 w-6 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center text-green-600 dark:text-green-400">
                <FileText className="h-4 w-4" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {application.applicant?.firstName || ""}{" "}
                    {application.applicant?.middleName || ""}{" "}
                    {application.applicant?.surname || ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {formatDate(application.applicant?.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">
                    {application.applicant?.gender || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">
                    {application.applicant?.nationality || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {application.applicant?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {application.applicant?.phone || "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Physical Address
                  </p>
                  <p className="font-medium">
                    {application.applicant?.physicalAddress || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education History */}
        <Card className="rounded-lg overflow-hidden">
          <CardHeader className="bg-purple-50/50 dark:bg-purple-950/20 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-6 w-6 bg-purple-100 dark:bg-purple-900/30 rounded-md flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FileText className="h-4 w-4" />
              </div>
              Education History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {application.applicant?.educationHistory &&
            application.applicant.educationHistory.length > 0 ? (
              <div className="space-y-4">
                {application.applicant.educationHistory.map(
                  (edu: any, index: number) => (
                    <div key={edu.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{edu.institutionName}</h4>
                        <Badge variant="outline" className="rounded-md">
                          {edu.qualification}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {edu.startYear} - {edu.endYear || "Present"}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No education history provided.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card className="rounded-lg overflow-hidden">
          <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-6 w-6 bg-amber-100 dark:bg-amber-900/30 rounded-md flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Briefcase className="h-4 w-4" />
              </div>
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {application.workExperiences &&
            application.workExperiences.length > 0 ? (
              <div className="space-y-4">
                {application.workExperiences.map((exp: any) => (
                  <div key={exp.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{exp.position}</h4>
                      <Badge variant="outline" className="rounded-md">
                        {exp.company}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatDate(exp.startDate)} -{" "}
                      {exp.endDate ? formatDate(exp.endDate) : "Present"}
                    </p>
                    <p className="text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No work experience provided.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sponsor & Next of Kin */}
        <Card className="rounded-lg overflow-hidden">
          <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-6 w-6 bg-orange-100 dark:bg-orange-900/30 rounded-md flex items-center justify-center text-orange-600 dark:text-orange-400">
                <FileText className="h-4 w-4" />
              </div>
              Sponsor & Next of Kin
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Sponsor Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {application.applicant?.sponsorName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Relationship
                    </p>
                    <p className="font-medium">
                      {application.applicant?.sponsorRelationship || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">
                      {application.applicant?.sponsorOccupation || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {application.applicant?.sponsorPhone || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {application.applicant?.sponsorAddress || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Next of Kin Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {application.applicant?.nextOfKinName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Relationship
                    </p>
                    <p className="font-medium">
                      {application.applicant?.nextOfKinRelationship || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">
                      {application.applicant?.nextOfKinOccupation || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {application.applicant?.nextOfKinPhone || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {application.applicant?.nextOfKinAddress || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="rounded-lg overflow-hidden">
          <CardHeader className="bg-red-50/50 dark:bg-red-950/20 pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-6 w-6 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-center text-red-600 dark:text-red-400">
                <FileText className="h-4 w-4" />
              </div>
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {application.documents && application.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.documents.map((doc: any) => (
                  <div key={doc.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-md">
                        Uploaded
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No documents uploaded.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Submit Application
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
