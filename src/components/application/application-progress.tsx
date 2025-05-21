"use client";

import { Check } from "lucide-react";

interface ApplicationProgressProps {
  steps: { id: string; label: string }[];
  currentStepIndex: number;
  completedSteps: string[];
  onStepClick: (index: number) => void;
}

export function ApplicationProgress({
  steps,
  currentStepIndex,
  completedSteps,
  onStepClick,
}: ApplicationProgressProps) {
  return (
    <div className="relative">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = index === currentStepIndex;
          const isClickable =
            isCompleted ||
            index === currentStepIndex ||
            index === currentStepIndex + 1;

          return (
            <button
              key={step.id}
              className={`flex flex-col items-center relative z-10 ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                  isCompleted
                    ? "bg-blue-600 text-white"
                    : isCurrent
                      ? "bg-blue-100 border-2 border-blue-600 text-blue-600 dark:bg-blue-900/30"
                      : "bg-gray-200 text-gray-500 dark:bg-gray-800"
                }`}>
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={`text-xs hidden sm:block text-center ${
                  isCurrent
                    ? "font-medium text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                }`}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress line */}
      {/* <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 z-0">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{
            width: `${
              currentStepIndex === 0
                ? 0
                : currentStepIndex === steps.length - 1
                  ? "100%"
                  : `${(currentStepIndex / (steps.length - 1)) * 100}%`
            }`,
          }}
        />
      </div> */}
    </div>
  );
}
