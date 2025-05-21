"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader } from "lucide-react";
// import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const verificationSchema = z.object({
  verificationCode: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

export default function VerifyEmailStep({
  formData,
  updateFormData,
  isLastStep,
}: {
  formData: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
  updateFormData: (
    key: string,
    value: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  ) => void;
  onContinue: () => void;
  isLastStep: boolean;
}) {
  const { email, verificationCode } = formData;
  const [isResending, setIsResending] = useState(false);
  // const supabase = createClient();

  const form = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: verificationCode || "",
    },
  });

  // Use form's built-in submitting state
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof verificationSchema>) => {
    // try {
    //   updateFormData("verificationCode", values.verificationCode);
    //   const { data, error } = await supabase.auth.verifyOtp({
    //     email,
    //     token: values.verificationCode,
    //     type: "signup",
    //   });
    //   if (error) {
    //     toast.error("Verification failed", {
    //       description: error.message.includes("Invalid OTP")
    //         ? "The verification code is invalid or has expired. Please request a new one."
    //         : error.message,
    //     });
    //     return;
    //   }
    //   // Update public.users table after successful verification
    //   if (data.user) {
    //     const { error: updateError } = await supabase
    //       .from("users")
    //       .update({
    //         email_verified: true,
    //         verified_at: new Date().toISOString(),
    //       })
    //       .eq("id", data.user.id);
    //     if (updateError) {
    //       console.error("Failed to update public.users:", updateError);
    //       // Don't fail the whole flow - just log the error
    //     }
    //   }
    //   toast.success("Email verified successfully!");
    //   window.location.reload();
    // } catch {
    //   toast.error("An unexpected error occurred");
    // }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    // try {
    //   const { error } = await supabase.auth.signInWithOtp({
    //     email,
    //     options: {
    //       emailRedirectTo: `${window.location.origin}/auth/callback`,
    //     },
    //   });

    //   if (error) throw error;

    //   toast.success(
    //     "New verification code sent! The code will expire in 5 minutes."
    //   );
    // } catch {
    //   toast.error(
    //     "Failed to resend code! Please wait and try again after 5 minutes."
    //   );
    // } finally {
    //   setIsResending(false);
    // }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium">{email}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            The verification code will expire in 5 minutes
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="verificationCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        {[...Array(6)].map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          <div className="flex justify-center text-sm">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              disabled={isResending}
              onClick={handleResendCode}>
              {isResending ? (
                <span className="flex items-center">
                  <Loader className="mr-1 h-3 w-3 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Resend Code"
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </span>
            ) : isLastStep ? (
              "Complete"
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
