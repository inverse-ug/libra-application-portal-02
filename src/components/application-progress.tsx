"use client"

import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  label: string
  completed: boolean
  active: boolean
}

interface ApplicationProgressProps {
  steps: Step[]
  onStepClick: (stepId: string) => void
  className?: string
}

export function ApplicationProgress({ steps, onStepClick, className }: ApplicationProgressProps) {
  return (
    <div className={cn("w-full overflow-x-auto pb-2", className)}>
      <div className="flex min-w-max">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => onStepClick(step.id)}
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                step.active ? "text-primary" : step.completed ? "text-primary/70" : "text-muted-foreground",
                "hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              )}
            >
              <div className="flex items-center justify-center">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors",
                    step.active
                      ? "border-primary bg-primary text-primary-foreground"
                      : step.completed
                        ? "border-primary/70 bg-primary/10"
                        : "border-muted-foreground/30",
                  )}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
              </div>
              <span className="mt-1.5 text-xs font-medium max-w-[80px] text-center">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <div className={cn("h-px w-10 mx-1", step.completed ? "bg-primary/70" : "bg-muted-foreground/30")} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
