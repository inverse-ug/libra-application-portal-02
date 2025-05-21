"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
// import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface WelcomeStepProps {
  formData: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
  isSubmitting: boolean;
  isLastStep: boolean;
  onContinue: () => void; // Reusing the existing onContinue prop
}

export default function WelcomeStep({
  formData,
  isSubmitting,
}: WelcomeStepProps) {
  const { firstName } = formData;
  // const supabase = createClient();
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true);
    // try {
    //   // Get current user
    //   const {
    //     data: { user },
    //     error: authError,
    //   } = await supabase.auth.getUser();

    //   if (authError || !user) {
    //     throw new Error(authError?.message || "No authenticated user found");
    //   }

    //   // Mark onboarding as complete
    //   const { error } = await supabase
    //     .from("users")
    //     .update({ onboarding_complete: true })
    //     .eq("id", user.id);

    //   if (error) throw error;

    //   // Redirect to dashboard
    //   router.push("/school");
    // } catch (error) {
    //   toast.error(
    //     error instanceof Error ? error.message : "Failed to complete onboarding"
    //   );
    // } finally {
    // }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">
          Welcome to the Uganda Mathematical Society!
        </h1>
        <p className="text-muted-foreground mt-2">
          Congratulations, {firstName}! Your account has been successfully
          created.
        </p>
      </div>

      <div className="space-y-4 bg-muted p-4 rounded-lg">
        <h3 className="font-semibold">What&apos;s Next?</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span>Register students for the upcoming mathematics olympiad</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span>Access and review past olympiad results</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span>Manage your school&apos;s participation in UMS events</span>
          </li>
        </ul>
      </div>

      <Button
        className="w-full"
        onClick={handleCompleteOnboarding}
        disabled={isSubmitting || isCompleting}>
        {isSubmitting || isCompleting ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Get Started
      </Button>
    </div>
  );
}
