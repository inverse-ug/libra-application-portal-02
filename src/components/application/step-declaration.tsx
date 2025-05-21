"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { updateDeclaration, submitApplication } from "@/app/actions/application-actions"
import { useRouter } from "next/navigation"

interface ApplicationStepDeclarationProps {
  application: any
  onComplete: () => void
}

export function ApplicationStepDeclaration({ application, onComplete }: ApplicationStepDeclarationProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(application?.declarationSigned || false)

  const handleSubmit = async () => {
    if (!agreed) {
      setError("You must agree to the declaration before submitting your application.")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // First update the declaration status
      await updateDeclaration(application.id, { declarationSigned: true })

      // Then submit the application
      await submitApplication(application.id)

      // Navigate to the application details page
      router.push(`/my-applications/${application.id}`)
      onComplete()
    } catch (error) {
      console.error("Error submitting application:", error)
      setError("An error occurred while submitting your application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Declaration</h2>
        <p className="text-muted-foreground">
          Please read and agree to the following declaration before submitting your application.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border space-y-4">
        <h3 className="font-medium text-lg">Applicant's Declaration</h3>

        <p className="text-sm">
          I, {application?.applicant?.firstName} {application?.applicant?.middleName} {application?.applicant?.surname},
          hereby declare that the information provided in this application is true and correct to the best of my
          knowledge.
        </p>

        <p className="text-sm">I understand that:</p>

        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>The application fee of Fifty Thousand Shillings (UGX 50,000) is non-refundable.</li>
          <li>
            Provision of any false information will lead to automatic cancellation and discontinuation once discovered.
          </li>
          <li>I must submit all required documents for my application to be considered complete.</li>
          <li>I must comply with all the rules and regulations of the institution if admitted.</li>
        </ul>

        <div className="flex items-start space-x-2 pt-4">
          <Checkbox
            id="declaration"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="mt-1"
          />
          <label
            htmlFor="declaration"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I confirm that I have read and understood the above declaration and that all information provided in this
            application is accurate and complete.
          </label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push(`/my-applications`)} className="rounded-lg">
          Save and Exit
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !agreed}
          className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </div>
  )
}
