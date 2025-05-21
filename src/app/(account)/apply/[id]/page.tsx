"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { getApplicationById, updateApplicationStep } from "@/app/actions/application-actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { ApplicationStepPersonal } from "@/components/application/step-personal"
import { ApplicationStepEducation } from "@/components/application/step-education"
import { ApplicationStepSponsor } from "@/components/application/step-sponsor"
import { ApplicationStepDocuments } from "@/components/application/step-documents"
import { ApplicationStepReview } from "@/components/application/step-review"
import { ApplicationStepDeclaration } from "@/components/application/step-declaration"
import { ApplicationProgress } from "@/components/application/application-progress"

// Define application steps
const STEPS = [
  { id: "personal", label: "Personal Information" },
  { id: "education", label: "Education" },
  { id: "sponsor", label: "Sponsor & Next of Kin" },
  { id: "documents", label: "Documents" },
  { id: "review", label: "Review" },
  { id: "declaration", label: "Declaration" },
]

export default function ApplicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useUser()
  const [application, setApplication] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true)
        const data = await getApplicationById(params.id)
        setApplication(data)

        // Set current step and completed steps from application data
        if (data) {
          const stepIndex = data.currentStep ? STEPS.findIndex((step) => step.id === data.currentStep) : 0
          setCurrentStepIndex(stepIndex >= 0 ? stepIndex : 0)
          setCompletedSteps(data.completedSteps || [])
        }
      } catch (error) {
        console.error("Error fetching application:", error)
        setError("Failed to load application. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchApplication()
    }
  }, [params.id])

  const currentStep = STEPS[currentStepIndex]

  const handleNext = async () => {
    if (currentStepIndex < STEPS.length - 1) {
      try {
        setIsUpdating(true)

        // Add current step to completed steps if not already included
        const updatedCompletedSteps = [...completedSteps]
        if (!updatedCompletedSteps.includes(currentStep.id)) {
          updatedCompletedSteps.push(currentStep.id)
        }

        // Calculate progress percentage
        const progress = Math.round((updatedCompletedSteps.length / STEPS.length) * 100)

        // Update application in database
        await updateApplicationStep(params.id, {
          currentStep: STEPS[currentStepIndex + 1].id,
          completedSteps: updatedCompletedSteps,
          progress,
        })

        // Update local state
        setCompletedSteps(updatedCompletedSteps)
        setCurrentStepIndex(currentStepIndex + 1)
      } catch (error) {
        console.error("Error updating application step:", error)
        setError("Failed to save progress. Please try again.")
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleBack = async () => {
    if (currentStepIndex > 0) {
      try {
        setIsUpdating(true)

        // Update application in database
        await updateApplicationStep(params.id, {
          currentStep: STEPS[currentStepIndex - 1].id,
          completedSteps,
          progress: Math.round((completedSteps.length / STEPS.length) * 100),
        })

        // Update local state
        setCurrentStepIndex(currentStepIndex - 1)
      } catch (error) {
        console.error("Error updating application step:", error)
        setError("Failed to navigate back. Please try again.")
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const goToStep = async (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      // Only allow navigation to completed steps or the current step + 1
      if (
        completedSteps.includes(STEPS[stepIndex].id) ||
        stepIndex === currentStepIndex ||
        stepIndex === currentStepIndex + 1
      ) {
        try {
          setIsUpdating(true)

          // Update application in database
          await updateApplicationStep(params.id, {
            currentStep: STEPS[stepIndex].id,
            completedSteps,
            progress: Math.round((completedSteps.length / STEPS.length) * 100),
          })

          // Update local state
          setCurrentStepIndex(stepIndex)
        } catch (error) {
          console.error("Error navigating to step:", error)
          setError("Failed to navigate to the selected step. Please try again.")
        } finally {
          setIsUpdating(false)
        }
      }
    }
  }

  if (isUserLoading || isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <Card className="p-6 rounded-xl shadow-sm">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="flex justify-between">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-2 w-10" />
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            The application you are looking for does not exist or has been removed. Please go back and try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <Card className="p-6 rounded-xl shadow-sm">
        {error && (
          <Alert variant="destructive" className="mb-6 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6">
            Application for {application.program?.title}
            {application.isShortCourse
              ? ` (Short Course - ${application.shortCourseDuration})`
              : application.intake
                ? ` - ${application.intake?.name}`
                : ""}
          </h1>

          <ApplicationProgress
            steps={STEPS}
            currentStepIndex={currentStepIndex}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </div>

        <div className="mb-8">
          {currentStep.id === "personal" && (
            <ApplicationStepPersonal application={application} user={user} onComplete={handleNext} />
          )}

          {currentStep.id === "education" && (
            <ApplicationStepEducation application={application} user={user} onComplete={handleNext} />
          )}

          {currentStep.id === "sponsor" && (
            <ApplicationStepSponsor application={application} user={user} onComplete={handleNext} />
          )}

          {currentStep.id === "documents" && (
            <ApplicationStepDocuments application={application} user={user} onComplete={handleNext} />
          )}

          {currentStep.id === "review" && <ApplicationStepReview application={application} onComplete={handleNext} />}

          {currentStep.id === "declaration" && (
            <ApplicationStepDeclaration application={application} onComplete={handleNext} />
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isUpdating}
            className="rounded-lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep.id !== "declaration" ? (
            <Button
              onClick={handleNext}
              disabled={isUpdating || !completedSteps.includes(currentStep.id)}
              className="rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => router.push(`/my-applications/${application.id}`)}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="mr-2 h-4 w-4" />
              View Application
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
