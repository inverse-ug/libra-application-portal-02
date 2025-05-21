"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ApplicationStepProps {
  title: string
  description?: string
  children: ReactNode
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  backLabel?: string
  isLastStep?: boolean
  isSubmitting?: boolean
  className?: string
  footerClassName?: string
}

export function ApplicationStep({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = "Next",
  backLabel = "Back",
  isLastStep = false,
  isSubmitting = false,
  className,
  footerClassName,
}: ApplicationStepProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className={cn("flex flex-col sm:flex-row gap-3 sm:justify-between", footerClassName)}>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto order-2 sm:order-1">
            {backLabel}
          </Button>
        )}
        {onNext && (
          <Button onClick={onNext} className="w-full sm:w-auto order-1 sm:order-2" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isLastStep ? "Submit Application" : nextLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
