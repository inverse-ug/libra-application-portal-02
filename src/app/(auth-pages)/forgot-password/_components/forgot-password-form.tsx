"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader, ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "../../actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsSubmitting(true);

    try {
      // Create FormData from the form values
      const formData = new FormData();
      formData.append("email", values.email);

      // Call the server action
      const result = await requestPasswordReset(formData);

      if (result.success) {
        toast.success("Reset code sent successfully");
        setEmailSent(true);
        setSentEmail(values.email);
      } else {
        toast.error("Failed to send reset code", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBackToLogin = () => {
    router.push("/login");
    document.dispatchEvent(new Event("startNavigation"));
  };

  const handleResendCode = async () => {
    if (!sentEmail) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("email", sentEmail);

      const result = await requestPasswordReset(formData);

      if (result.success) {
        toast.success("Reset code sent again");
      } else {
        toast.error("Failed to resend code", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryDifferentEmail = () => {
    setEmailSent(false);
    setSentEmail("");
    form.reset();
  };

  if (emailSent) {
    return (
      <div className="px-2 py-8 sm:p-8">
        <div className="mx-auto max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Check Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a 6-digit reset code to{" "}
              <span className="font-medium">{sentEmail}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              The reset code will expire in 1 hour
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => {
                router.push(
                  `/reset-password?email=${encodeURIComponent(sentEmail)}`
                );
                document.dispatchEvent(new Event("startNavigation"));
              }}
              className="w-full">
              Enter Reset Code
            </Button>

            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={isSubmitting}
                className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleTryDifferentEmail}
                className="w-full">
                Try Different Email
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleBackToLogin}
              className="text-sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-8 sm:p-8">
      <div className="mx-auto max-w-md">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a code to reset your
            password
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <Button
            type="button"
            variant="link"
            onClick={handleBackToLogin}
            className="text-sm cursor-pointer">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
