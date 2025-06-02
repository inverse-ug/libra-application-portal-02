"use client";

import { useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader, ArrowLeft, Check, X } from "lucide-react";
import { resetPassword, requestPasswordReset } from "../../actions";

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface PasswordRequirement {
  text: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    text: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    text: "One uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    text: "One lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    text: "One number",
    test: (password: string) => /[0-9]/.test(password),
  },
];

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const strength = useMemo(() => {
    const passedRequirements = passwordRequirements.filter((req) =>
      req.test(password)
    );
    return {
      score: passedRequirements.length,
      total: passwordRequirements.length,
      percentage:
        (passedRequirements.length / passwordRequirements.length) * 100,
    };
  }, [password]);

  const getStrengthColor = () => {
    if (strength.percentage === 0) return "bg-gray-200";
    if (strength.percentage <= 25) return "bg-red-500";
    if (strength.percentage <= 50) return "bg-orange-500";
    if (strength.percentage <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength.percentage === 0) return "Enter password";
    if (strength.percentage <= 25) return "Weak";
    if (strength.percentage <= 50) return "Fair";
    if (strength.percentage <= 75) return "Good";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground text-xs">
            Password strength
          </span>
          <span
            className={`font-medium text-xs ${
              strength.percentage <= 25
                ? "text-red-600"
                : strength.percentage <= 50
                  ? "text-orange-600"
                  : strength.percentage <= 75
                    ? "text-yellow-600"
                    : "text-green-600"
            }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {passwordRequirements.map((requirement, index) => {
          const isValid = requirement.test(password);
          return (
            <div
              key={index}
              className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
                isValid ? "text-green-600" : "text-gray-500"
              }`}>
              {isValid ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-gray-400" />
              )}
              <span className={`text-xs ${isValid ? "line-through" : ""}`}>
                {requirement.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const resetPasswordSchema = z
  .object({
    resetCode: z
      .string()
      .length(6, "Code must be exactly 6 digits")
      .regex(/^\d+$/, "Code must contain only numbers"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      resetCode: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch password field for strength indicator
  const password = form.watch("password");

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setIsSubmitting(true);

    try {
      // Call the server action
      const result = await resetPassword(values.resetCode, values.password);

      if (result.success) {
        toast.success("Password reset successful");
        router.push("/login");
      } else {
        toast.error("Password reset failed", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email not found. Please go back and try again.");
      return;
    }

    setIsResending(true);
    try {
      const formData = new FormData();
      formData.append("email", email);

      const result = await requestPasswordReset(formData);

      if (result.success) {
        toast.success("New reset code sent to your email");
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

  const handleBackToForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="px-2 py-8 sm:p-8">
      <div className="mx-auto max-w-md">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium">{email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Then set your new password below
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="resetCode"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel>Reset Code</FormLabel>
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

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            autoComplete="new-password"
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}>
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                        <PasswordStrengthIndicator password={password || ""} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          autoComplete="new-password"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={isSubmitting}>
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword
                              ? "Hide password"
                              : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !form.formState.isValid}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>

        <div className="flex flex-col items-center space-y-2 mt-6">
          <Button
            type="button"
            variant="link"
            onClick={handleBackToForgotPassword}
            className="text-sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Forgot Password
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleBackToLogin}
            className="text-sm">
            Remember your password? Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
