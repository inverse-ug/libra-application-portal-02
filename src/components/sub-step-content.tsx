import type { SubStepConfig } from "@/config/auth-steps";

interface SubStepContentProps {
  subStep: SubStepConfig;
  formData: Record<string, any>;
  updateFormData: (key: string, value: any) => void;
  onContinue: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  isLastSubStep: boolean;
}

export default function SubStepContent({
  subStep,
  formData,
  updateFormData,
  onContinue,
  onBack,
  isSubmitting,
  isLastStep,
  isLastSubStep,
}: SubStepContentProps) {
  const SubStepComponent = subStep.component;

  return (
    <div className="space-y-6">
      <SubStepComponent
        formData={formData}
        updateFormData={updateFormData}
        onContinue={onContinue}
        onBack={onBack}
        isSubmitting={isSubmitting}
        isLastStep={isLastStep}
        isLastSubStep={isLastSubStep}
      />
    </div>
  );
}
