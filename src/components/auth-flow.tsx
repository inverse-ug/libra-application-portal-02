"use client";

import { useState, useEffect } from "react";
import {
  steps,
  getAllSubSteps,
  findMainStepForSubStep,
} from "@/config/auth-steps";
import { ChevronLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import Logo from "./logo";
import SubStepContent from "./sub-step-content";

export default function AuthFlow() {
  const [isInitialized, setIsInitialized] = useState(false);
  // Track which main step we're on
  const [currentMainStepIndex, setCurrentMainStepIndex] = useState(0);
  // Track which sub-step we're on (across all steps)
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  // Track completed sub-steps by ID
  const [completedSubSteps, setCompletedSubSteps] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const isSubmitting = false;
  const allSubSteps = getAllSubSteps();
  const currentSubStep = allSubSteps[currentSubStepIndex];
  const currentMainStep = steps[currentMainStepIndex];

  // Get the current sub-step's position within its main step
  const currentSubStepLocalIndex = currentMainStep.subSteps.findIndex(
    (subStep) => subStep.id === currentSubStep.id
  );

  useEffect(() => {
    // In a real app, you'd check authentication here
    setIsInitialized(true);
  }, []);

  // Effect to update main step index when sub-step changes
  useEffect(() => {
    if (currentSubStep) {
      const mainStep = findMainStepForSubStep(currentSubStep.id);
      const mainStepIndex = steps.findIndex((step) => step.id === mainStep?.id);
      if (mainStepIndex !== -1 && mainStepIndex !== currentMainStepIndex) {
        setCurrentMainStepIndex(mainStepIndex);
      }
    }
  }, [currentSubStep, currentMainStepIndex]);

  const handleLogout = async () => {
    // In a real app, perform signOut here
    router.push("/login");
    router.refresh();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Logo className="animate-pulse" />
      </div>
    );
  }

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = async () => {
    // Mark current sub-step as completed
    if (!completedSubSteps.includes(currentSubStep.id)) {
      setCompletedSubSteps((prev) => [...prev, currentSubStep.id]);
    }

    // Move to next sub-step if available
    if (currentSubStepIndex < allSubSteps.length - 1) {
      setCurrentSubStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    // Move to previous sub-step if available
    if (currentSubStepIndex > 0) {
      setCurrentSubStepIndex((prev) => prev - 1);
    }
  };

  // Calculate whether this is the last sub-step in the current main step
  const isLastSubStep =
    currentSubStepLocalIndex === currentMainStep.subSteps.length - 1;
  // Calculate whether this is the last sub-step overall
  const isLastStep = currentSubStepIndex === allSubSteps.length - 1;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Left sidebar - Step indicator */}
        <div className="w-full md:w-[420px] md:bg-muted/20 py-8 md:px-8 bg-background border-r border-border relative">
          <div className="mb-12 hidden md:flex items-center justify-between">
            <Logo />
          </div>

          {/* Mobile header */}
          <div className="flex flex-col gap-6 justify-between items-center mb-8 md:hidden px-6">
            <div className="flex items-center justify-center w-full">
              <Logo />
              {isLoggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
            <StepIndicator.Mobile
              steps={steps}
              currentStepIndex={currentMainStepIndex}
              completedSteps={steps
                .filter((_, index) => {
                  // A step is completed if all its sub-steps are completed
                  const step = steps[index];
                  return step.subSteps.every((subStep) =>
                    completedSubSteps.includes(subStep.id)
                  );
                })
                .map((step) => step.id)}
            />
          </div>

          <div className="hidden md:block">
            <StepIndicator.Desktop
              steps={steps}
              currentStepIndex={currentMainStepIndex}
              completedSteps={steps
                .filter((_, index) => {
                  // A step is completed if all its sub-steps are completed
                  const step = steps[index];
                  return step.subSteps.every((subStep) =>
                    completedSubSteps.includes(subStep.id)
                  );
                })
                .map((step) => step.id)}
            />
          </div>

          <div className="absolute bottom-8 left-8 hidden md:flex md:space-x-4">
            {currentSubStepIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-muted-foreground flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            )}
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button
                variant="ghost"
                asChild
                size="sm"
                className="text-muted-foreground hover:text-primary">
                <Link href="/login" className="text-sm text-muted-foreground">
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Right content - Step form */}
        <div className="w-full md:flex-1 p-8 bg-background flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Sub-step title and description */}
            {/* <div className="mb-6">
              <h2 className="text-2xl font-bold">{currentSubStep.title}</h2>
              <p className="text-muted-foreground">
                {currentSubStep.description}
              </p>
            </div> */}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSubStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}>
                <SubStepContent
                  subStep={currentSubStep}
                  formData={formData}
                  updateFormData={updateFormData}
                  onContinue={handleContinue}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                  isLastStep={isLastStep}
                  isLastSubStep={isLastSubStep}
                />
              </motion.div>
            </AnimatePresence>

            {/* Progress dots for sub-steps within the current main step */}
            <div className="flex justify-center mt-8 space-x-2">
              {currentMainStep.subSteps.map((subStep, index) => (
                <div
                  key={subStep.id}
                  className={`h-1.5 w-16 rounded-full transition-colors ${
                    index === currentSubStepLocalIndex
                      ? "bg-primary"
                      : completedSubSteps.includes(subStep.id)
                        ? index < currentSubStepLocalIndex
                          ? "bg-primary"
                          : "bg-primary/30"
                        : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile footer */}
      <div className="p-4 border-t border-border bg-background flex justify-between md:hidden">
        {currentSubStepIndex > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-muted-foreground flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        )}
        {isLoggedIn ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
            onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        ) : (
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="text-muted-foreground hover:text-primary">
            <Link href="/login" className="text-sm text-muted-foreground">
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
