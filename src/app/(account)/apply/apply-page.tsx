"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  getApplicationById,
  updateApplicationStep,
} from "@/app/actions/application-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ApplicationStepBasics } from "@/components/application/step-basics";
import { ApplicationStepPersonal } from "@/components/application/step-personal";
import { ApplicationStepEducation } from "@/components/application/step-education";
import { ApplicationStepSponsor } from "@/components/application/step-sponsor";
import { ApplicationStepDocuments } from "@/components/application/step-documents";
import { ApplicationStepReview } from "@/components/application/step-review";
import { ApplicationStepDeclaration } from "@/components/application/step-declaration";
import { ApplicationProgress } from "@/components/application/application-progress";

// Define application steps - Basics is the first step
const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "personal", label: "Personal Info" },
  { id: "education", label: "Education" },
  { id: "sponsor", label: "Sponsor & Next of Kin" },
  { id: "documents", label: "Documents" },
  { id: "review", label: "Review" },
  { id: "declaration", label: "Declaration" },
];

export default function ApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isUserLoading } = useUser();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get application ID and preselected values from query params
  const applicationId = searchParams.get("id") || undefined;
  const preselectedIntakeId = searchParams.get("intakeId") || undefined;
  const preselectedProgramId = searchParams.get("programId") || undefined;
  const preselectedCourseType = searchParams.get("courseType") as
    | "long"
    | "short"
    | undefined;

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true);

        if (applicationId) {
          // Load existing application
          const data = await getApplicationById(applicationId);
          setApplication(data);

          // Set current step and completed steps from application data
          if (data) {
            // Find the current step index, default to 0 (basics) if not found
            const stepIndex = data.currentStep
              ? STEPS.findIndex((step) => step.id === data.currentStep)
              : 0;
            setCurrentStepIndex(stepIndex >= 0 ? stepIndex : 0);

            // Set completed steps
            setCompletedSteps(data.completedSteps || []);
          }
        } else {
          // New application - start with empty state
          setApplication(null);
          setCurrentStepIndex(0);
          setCompletedSteps([]);
        }
      } catch (error) {
        console.error("Error fetching application:", error);
        setError("Failed to load application. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const currentStep = STEPS[currentStepIndex];

  const handleNext = async () => {
    if (currentStepIndex < STEPS.length - 1 && application?.id) {
      try {
        setIsUpdating(true);

        // Add current step to completed steps if not already included
        const updatedCompletedSteps = [...completedSteps];
        if (!updatedCompletedSteps.includes(currentStep.id)) {
          updatedCompletedSteps.push(currentStep.id);
        }

        // Calculate progress percentage
        const progress = Math.round(
          (updatedCompletedSteps.length / STEPS.length) * 100
        );

        // Update application in database
        await updateApplicationStep(application.id, {
          currentStep: STEPS[currentStepIndex + 1].id,
          completedSteps: updatedCompletedSteps,
          progress,
        });

        // Update local state
        setCompletedSteps(updatedCompletedSteps);
        setCurrentStepIndex(currentStepIndex + 1);
      } catch (error) {
        console.error("Error updating application step:", error);
        setError("Failed to save progress. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleBack = async () => {
    if (currentStepIndex > 0 && application?.id) {
      try {
        setIsUpdating(true);

        // Update application in database
        await updateApplicationStep(application.id, {
          currentStep: STEPS[currentStepIndex - 1].id,
          completedSteps,
          progress: Math.round((completedSteps.length / STEPS.length) * 100),
        });

        // Update local state
        setCurrentStepIndex(currentStepIndex - 1);
      } catch (error) {
        console.error("Error updating application step:", error);
        setError("Failed to navigate back. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const goToStep = async (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < STEPS.length && application?.id) {
      // Only allow navigation to completed steps or the current step + 1
      if (
        completedSteps.includes(STEPS[stepIndex].id) ||
        stepIndex === currentStepIndex ||
        stepIndex === currentStepIndex + 1
      ) {
        try {
          setIsUpdating(true);

          // Update application in database
          await updateApplicationStep(application.id, {
            currentStep: STEPS[stepIndex].id,
            completedSteps,
            progress: Math.round((completedSteps.length / STEPS.length) * 100),
          });

          // Update local state
          setCurrentStepIndex(stepIndex);
        } catch (error) {
          console.error("Error navigating to step:", error);
          setError(
            "Failed to navigate to the selected step. Please try again."
          );
        } finally {
          setIsUpdating(false);
        }
      }
    }
  };

  // Handle application creation and step completion
  const handleStepComplete = async (createdApplication?: any) => {
    try {
      if (createdApplication) {
        // New application was created - update URL and state
        setApplication(createdApplication);
        const newUrl = `/apply?id=${createdApplication.id}`;
        router.replace(newUrl);
      }

      if (application?.id || createdApplication?.id) {
        // Refresh application data
        const appId = createdApplication?.id || application.id;
        const updatedApplication = await getApplicationById(appId);
        setApplication(updatedApplication);
      }

      handleNext();
    } catch (error) {
      console.error("Error refreshing application data:", error);
      handleNext();
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="p-2 sm:p-4 md:p-6 max-w-5xl mx-auto">
        <Card className="p-3 sm:p-4 md:p-6 rounded-xl shadow-sm">
          <div className="space-y-4 sm:space-y-6">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
            <div className="flex flex-wrap gap-2 justify-between">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-2 w-8 sm:w-10 flex-shrink-0" />
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="space-y-3 sm:space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 sm:h-12 w-full" />
              ))}
            </div>
            <div className="flex justify-between gap-2">
              <Skeleton className="h-9 sm:h-10 w-20 sm:w-24" />
              <Skeleton className="h-9 sm:h-10 w-20 sm:w-24" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // For new applications, show a simplified header
  const isNewApplication = !application;
  const programTitle = application?.program?.title || "New Application";

  // Truncate long program titles for mobile
  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  const displayTitle =
    typeof window !== "undefined" && window.innerWidth < 640
      ? truncateTitle(programTitle)
      : programTitle;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="p-2 sm:p-4 md:p-6 max-w-5xl mx-auto">
        <Card className="p-3 sm:p-4 md:p-6 rounded-xl shadow-sm overflow-hidden">
          {error && (
            <Alert variant="destructive" className="mb-4 sm:mb-6 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="break-words">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 break-words leading-tight">
                <span className="block sm:inline">
                  {isNewApplication
                    ? "Create New Application"
                    : `Application for `}
                </span>
                {!isNewApplication && (
                  <>
                    <span className="block sm:inline text-blue-600 dark:text-blue-400">
                      {displayTitle}
                    </span>
                    {application.isShortCourse && (
                      <span className="block sm:inline text-sm sm:text-base text-muted-foreground mt-1 sm:mt-0 sm:ml-2">
                        (Short Course -{" "}
                        {application.shortCourseDuration || "3 months"})
                      </span>
                    )}
                    {!application.isShortCourse && application.intake && (
                      <span className="block sm:inline text-sm sm:text-base text-muted-foreground mt-1 sm:mt-0 sm:ml-2">
                        - {application.intake.name}
                      </span>
                    )}
                  </>
                )}
              </h1>
            </div>

            {!isNewApplication && (
              <div className="overflow-x-auto">
                <ApplicationProgress
                  steps={STEPS}
                  currentStepIndex={currentStepIndex}
                  completedSteps={completedSteps}
                  onStepClick={goToStep}
                />
              </div>
            )}
          </div>

          <div className="mb-6 sm:mb-8 overflow-hidden">
            <div className="min-h-[400px]">
              {currentStep.id === "basics" && (
                <ApplicationStepBasics
                  application={application}
                  onComplete={handleStepComplete}
                  preselectedIntakeId={preselectedIntakeId}
                  preselectedProgramId={preselectedProgramId}
                  preselectedCourseType={preselectedCourseType}
                />
              )}

              {currentStep.id === "personal" && application && (
                <ApplicationStepPersonal
                  application={application}
                  user={user}
                  onComplete={() => handleStepComplete()}
                />
              )}

              {currentStep.id === "education" && application && (
                <ApplicationStepEducation
                  application={application}
                  user={user}
                  onComplete={() => handleStepComplete()}
                />
              )}

              {currentStep.id === "sponsor" && application && (
                <ApplicationStepSponsor
                  application={application}
                  user={user}
                  onComplete={() => handleStepComplete()}
                />
              )}

              {currentStep.id === "documents" && application && (
                <ApplicationStepDocuments
                  application={application}
                  user={user}
                  onComplete={() => handleStepComplete()}
                />
              )}

              {currentStep.id === "review" && application && (
                <ApplicationStepReview
                  application={application}
                  onComplete={() => handleStepComplete()}
                />
              )}

              {currentStep.id === "declaration" && application && (
                <ApplicationStepDeclaration
                  application={application}
                  onComplete={() => handleStepComplete()}
                />
              )}
            </div>
          </div>

          {/* Only show navigation buttons if we have an application */}
          {application && (
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0 || isUpdating}
                className="rounded-lg order-2 sm:order-1 w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Back</span>
              </Button>

              {currentStep.id !== "declaration" ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    isUpdating || !completedSteps.includes(currentStep.id)
                  }
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 order-1 sm:order-2 w-full sm:w-auto">
                  <span className="truncate">Next</span>
                  <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    router.push(`/my-applications/${application.id}`)
                  }
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 order-1 sm:order-2 w-full sm:w-auto">
                  <Check className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">View Application</span>
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
