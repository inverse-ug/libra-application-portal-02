"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getIntakeById } from "@/app/actions/intake-actions"
import { createOrUpdateApplication } from "@/app/actions/application-actions"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ApplyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useUser()
  const [intake, setIntake] = useState<any>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const intakeData = await getIntakeById(params.id)
        setIntake(intakeData)

        if (intakeData?.programs && intakeData.programs.length > 0) {
          setPrograms(intakeData.programs)
          setSelectedProgram(intakeData.programs[0].id)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load intake information. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleSubmit = async () => {
    if (!user?.id || !selectedProgram) {
      setError("Please select a program to continue.")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const application = await createOrUpdateApplication(user.id, selectedProgram, {
        intakeId: params.id,
        isShortCourse: false,
      })

      if (application) {
        router.push(`/apply/${application.id}`)
      } else {
        setError("Failed to create application. Please try again.")
      }
    } catch (error) {
      console.error("Error creating application:", error)
      setError("An error occurred while creating your application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isUserLoading || isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-5 w-full max-w-md" />
                      <Skeleton className="h-4 w-full max-w-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!intake) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            The intake you are looking for does not exist or has been removed. Please go back and try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Apply for {intake.name}</CardTitle>
          <CardDescription>
            Please select the program you wish to apply for. The application fee is{" "}
            {formatCurrency(intake.applicationFee)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Select Program</h3>
              <RadioGroup value={selectedProgram} onValueChange={setSelectedProgram} className="space-y-3">
                {programs.map((program) => (
                  <div key={program.id} className="flex items-start space-x-2">
                    <RadioGroupItem value={program.id} id={program.id} className="mt-1" />
                    <div className="grid gap-1.5">
                      <Label htmlFor={program.id} className="font-medium">
                        {program.title} ({program.type})
                      </Label>
                      <p className="text-sm text-muted-foreground">{program.description}</p>
                      {program.tuitionFee && (
                        <p className="text-sm">
                          <span className="font-medium">Tuition Fee:</span> {formatCurrency(program.tuitionFee)}
                        </p>
                      )}
                      {program.duration && (
                        <p className="text-sm">
                          <span className="font-medium">Duration:</span> {program.duration}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedProgram}
            className="rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Processing..." : "Continue to Application"}
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
