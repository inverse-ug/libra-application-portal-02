import type { StepConfig } from "@/config/auth-steps";

interface StepIndicatorProps {
  steps: StepConfig[];
  currentStepIndex: number;
  completedSteps: string[];
}

function Desktop({
  steps,
  currentStepIndex,
  completedSteps,
}: StepIndicatorProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const isCurrent = index === currentStepIndex;
        const isCompleted = completedSteps.includes(step.id);
        const isLast = index === steps.length - 1;

        const nextStepIndex = index + 1;
        const nextStep = steps[nextStepIndex];
        const nextStepActive = nextStepIndex === currentStepIndex;
        const nextStepCompleted = nextStep
          ? completedSteps.includes(nextStep.id)
          : false;
        const lineColored = nextStepActive || nextStepCompleted;

        return (
          <div key={step.id} className="flex flex-col items-start">
            <div className="flex flex-row items-start">
              <div className="flex flex-col items-center">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCurrent
                      ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                      : isCompleted
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}>
                  {step.icon}
                </div>
                {!isLast && (
                  <div
                    className={`h-12 w-0.5 ${
                      lineColored ? "bg-primary" : "bg-gray-200"
                    } my-1`}></div>
                )}
              </div>
              <div className="ml-4">
                <h3
                  className={`text-sm font-medium ${
                    isCurrent ? "text-primary" : "text-gray-500"
                  }`}>
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Mobile({
  steps,
  currentStepIndex,
  completedSteps,
}: StepIndicatorProps) {
  return (
    <div className="flex w-full px-4">
      {steps.map((step, index) => {
        const isCurrent = index === currentStepIndex;
        const isCompleted = completedSteps.includes(step.id);
        const isPast = index < currentStepIndex;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className="flex items-center flex-1 last:flex-none">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isCurrent
                  ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                  : isCompleted
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-400"
              }`}>
              {step.icon}
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-1 ${
                  isPast ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const StepIndicator = {
  Desktop,
  Mobile,
};

export default StepIndicator;
