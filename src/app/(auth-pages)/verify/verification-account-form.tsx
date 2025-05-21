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
import { toast } from "sonner";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { verifyCode, resendVerificationCode } from "../actions";

const verificationSchema = z.object({
  verificationCode: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

// Component that uses useSearchParams()
export default function VerificationForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const [isResending, setIsResending] = useState(false);

  const identifier = email || phone;

  const form = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof verificationSchema>) => {
    try {
      const result = await verifyCode(values.verificationCode);

      if (result.success) {
        toast.success(result.message);
        window.location.href = "/"; // Redirect to home after successful verification
      } else {
        toast.error("Verification failed", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const handleResendCode = async () => {
    if (!identifier) return;

    setIsResending(true);
    try {
      const result = await resendVerificationCode(identifier);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Failed to resend code", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Verify Your Account</h1>
            <p className="text-muted-foreground mt-2">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium">{identifier}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              The verification code will expire in 1 hour
            </p>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="text-center">
                    Verification Code
                  </FormLabel>
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

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify Account"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
