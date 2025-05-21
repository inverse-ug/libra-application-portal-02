import { User, Building, Key, Mail, Check } from "lucide-react";
import PersonalDetailsStep from "@/components/steps/personal-details-step";
import SchoolSelectionStep from "@/components/steps/school-selection-step";
import CreateAccountStep from "@/components/steps/create-account-step";
import VerifyEmailStep from "@/components/steps/verify-email-step";
import WelcomeStep from "@/components/steps/welcome-step";
import { ReactNode } from "react";

// Define new sub-step interface
export interface SubStepConfig {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{
    formData: Record<string, any>;
    updateFormData: (key: string, value: any) => void;
    onContinue: () => void;
    onBack: () => void;
    isSubmitting: boolean;
    isLastStep: boolean;
    isLastSubStep: boolean;
  }>;
  fields?: string[];
}

// Update StepConfig to include subSteps
export interface StepConfig {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  subSteps: SubStepConfig[];
  skipIfLoggedIn?: boolean;
}

// Create placeholder sub-step components (you'll need to implement these)
// These are just placeholders - you'll need to create the actual components
const CredentialsStep = CreateAccountStep;
const PasswordStep = CreateAccountStep;
const TermsStep = CreateAccountStep;

const VerificationCodeStep = VerifyEmailStep;
const ConfirmationStep = VerifyEmailStep;
const AccountSetupStep = VerifyEmailStep;

const BasicInfoStep = PersonalDetailsStep;
const ContactInfoStep = PersonalDetailsStep;
const AddressStep = PersonalDetailsStep;
const BiographyStep = PersonalDetailsStep;

const InstitutionTypeStep = SchoolSelectionStep;
const CampusSelectionStep = SchoolSelectionStep;
const ProgramSelectionStep = SchoolSelectionStep;
const PreferencesStep = SchoolSelectionStep;

const SetupCompleteStep = WelcomeStep;
const NextStepsStep = WelcomeStep;
const ResourcesStep = WelcomeStep;

export const steps: StepConfig[] = [
  {
    id: "create-account",
    title: "Create Account",
    description: "Set up your login credentials",
    icon: <Key className="h-5 w-5" />,
    skipIfLoggedIn: true,
    subSteps: [
      {
        id: "credentials",
        title: "Email Credentials",
        description: "Enter your email address",
        component: CredentialsStep,
        fields: ["email"],
      },
      {
        id: "password",
        title: "Create Password",
        description: "Set a secure password",
        component: PasswordStep,
        fields: ["password", "confirmPassword"],
      },
      {
        id: "terms",
        title: "Terms & Conditions",
        description: "Review and accept terms",
        component: TermsStep,
        fields: ["termsAccepted", "privacyAccepted"],
      },
    ],
  },
  {
    id: "verify-email",
    title: "Verify Email",
    description: "Confirm your email address",
    icon: <Mail className="h-5 w-5" />,
    skipIfLoggedIn: true,
    subSteps: [
      {
        id: "verification-code",
        title: "Enter Code",
        description: "Enter the code sent to your email",
        component: VerificationCodeStep,
        fields: ["verificationCode"],
      },
      {
        id: "confirmation",
        title: "Confirm Identity",
        description: "Verify your identity",
        component: ConfirmationStep,
        fields: ["identityConfirmed"],
      },
      {
        id: "account-setup",
        title: "Account Security",
        description: "Set up security questions",
        component: AccountSetupStep,
        fields: ["securityQuestion", "securityAnswer"],
      },
    ],
  },
  {
    id: "personal-details",
    title: "Personal Details",
    description: "Tell us about yourself",
    icon: <User className="h-5 w-5" />,
    subSteps: [
      {
        id: "basic-info",
        title: "Basic Information",
        description: "Your name and birth date",
        component: BasicInfoStep,
        fields: ["firstName", "lastName", "dateOfBirth"],
      },
      {
        id: "contact-info",
        title: "Contact Information",
        description: "How to reach you",
        component: ContactInfoStep,
        fields: ["phoneNumber", "alternateEmail"],
      },
      {
        id: "address",
        title: "Address",
        description: "Your current address",
        component: AddressStep,
        fields: ["street", "city", "state", "zipCode", "country"],
      },
      {
        id: "biography",
        title: "About You",
        description: "Tell us more about yourself",
        component: BiographyStep,
        fields: ["biography", "interests"],
      },
    ],
  },
  {
    id: "school-selection",
    title: "Select School",
    description: "Find your institution",
    icon: <Building className="h-5 w-5" />,
    subSteps: [
      {
        id: "institution-type",
        title: "Institution Type",
        description: "Select your institution type",
        component: InstitutionTypeStep,
        fields: ["institutionType"],
      },
      {
        id: "campus-selection",
        title: "Campus",
        description: "Select your campus",
        component: CampusSelectionStep,
        fields: ["campusId"],
      },
      {
        id: "program-selection",
        title: "Program",
        description: "Select your program of study",
        component: ProgramSelectionStep,
        fields: ["programId"],
      },
      {
        id: "preferences",
        title: "Preferences",
        description: "Set your preferences",
        component: PreferencesStep,
        fields: ["startDate", "studyMode"],
      },
    ],
  },
  {
    id: "welcome",
    title: "Welcome",
    description: "You're all set!",
    icon: <Check className="h-5 w-5" />,
    subSteps: [
      {
        id: "setup-complete",
        title: "Registration Complete",
        description: "Your account is ready",
        component: SetupCompleteStep,
        fields: [],
      },
      {
        id: "next-steps",
        title: "Next Steps",
        description: "What happens next",
        component: NextStepsStep,
        fields: [],
      },
      {
        id: "resources",
        title: "Resources",
        description: "Helpful resources",
        component: ResourcesStep,
        fields: [],
      },
    ],
  },
];

// Helper function to get all subSteps flattened into a single array
export function getAllSubSteps(): SubStepConfig[] {
  return steps.flatMap((step) => step.subSteps);
}

// Helper function to find which main step a substep belongs to
export function findMainStepForSubStep(
  subStepId: string
): StepConfig | undefined {
  return steps.find((step) =>
    step.subSteps.some((subStep) => subStep.id === subStepId)
  );
}

// Helper function to get the index of a substep in the flattened array
export function getSubStepIndex(subStepId: string): number {
  const allSubSteps = getAllSubSteps();
  return allSubSteps.findIndex((subStep) => subStep.id === subStepId);
}

// Helper function to calculate which substeps are completed
export function getCompletedSubSteps(completedSubStepIds: string[]): string[] {
  return getAllSubSteps()
    .filter((_, index) => {
      const subStep = getAllSubSteps()[index];
      return completedSubStepIds.includes(subStep.id);
    })
    .map((subStep) => subStep.id);
}
