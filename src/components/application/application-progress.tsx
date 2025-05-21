"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface ApplicationProgressProps {
  steps: Step[];
  currentStepIndex: number;
  completedSteps: string[];
  onStepClick?: (index: number) => void;
}

export function ApplicationProgress({
  steps,
  currentStepIndex,
  completedSteps,
  onStepClick,
}: ApplicationProgressProps) {
  return (
    <div className="flex flex-wrap justify-between">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = index === currentStepIndex;
        const isClickable =
          isCompleted ||
          index === currentStepIndex ||
          index === currentStepIndex + 1;

        return (
          <div
            key={step.id}
            className={cn(
              "flex flex-col items-center mb-4",
              isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            )}
            onClick={() => isClickable && onStepClick?.(index)}>
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                isCompleted
                  ? "bg-blue-600 border-blue-600 text-white"
                  : isCurrent
                    ? "border-blue-600 text-blue-600"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              )}>
              {isCompleted ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium text-center max-w-[80px]",
                isCurrent ? "text-blue-600" : "text-muted-foreground"
              )}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
