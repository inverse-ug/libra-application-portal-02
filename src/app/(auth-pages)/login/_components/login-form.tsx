"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader } from "lucide-react";

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

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone is required")
    .superRefine((val, ctx) => {
      const isEmail = z.string().email().safeParse(val).success;
      const isPhone = /^(\+256|0)[0-9]{9}$/.test(val);

      if (!isEmail && !isPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Must be a valid email or Ugandan phone number (0XXX or +256XXX)",
        });
      }
    }),
  password: z.string().min(1, "Password is required"),
});

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: searchParams.get("email") || searchParams.get("phone") || "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      const result = await signIn("credentials", {
        identifier: values.identifier,
        password: values.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        // Map error codes/messages to user-friendly messages
        const errorMessages: Record<string, string> = {
          CredentialsSignin: "Invalid credentials. Please try again.",
          "account not verified": "Your account needs to be verified.",
          "invalid phone number": "Please enter a valid Ugandan phone number.",
          "account not found": "No account found with these credentials.",
          "server error": "The authentication server is currently unavailable.",
        };

        let friendlyError = "Login failed. Please try again.";

        // Check if error matches any known patterns
        for (const [errorKey, errorMessage] of Object.entries(errorMessages)) {
          if (result.error.toLowerCase().includes(errorKey.toLowerCase())) {
            friendlyError = errorMessage;
            break;
          }
        }

        // Handle unverified account case specially
        if (result.error.toLowerCase().includes("account not verified")) {
          const isEmail = values.identifier.includes("@");
          const verificationType = isEmail ? "email" : "phone";

          toast.message("Account Verification Required", {
            description: "You need to verify your account before logging in",
          });

          return router.push(
            `/verify?${verificationType}=${encodeURIComponent(values.identifier)}`
          );
        }

        toast.error(friendlyError);

        // Log the actual error for debugging
        if (process.env.NODE_ENV === "development") {
          console.error("Login error details:", result.error);
        }
      } else if (result?.ok) {
        toast.success("Login successful");
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast.error("An unexpected error occurred");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="px-2 py-8 sm:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com or 0755123456"
                      {...field}
                      autoComplete="username"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <a
                      href="/forgot-password"
                      className="text-sm font-medium text-primary hover:text-primary/90">
                      Forgot password?
                    </a>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        autoComplete="current-password"
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
