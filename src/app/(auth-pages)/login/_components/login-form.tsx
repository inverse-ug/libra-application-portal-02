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
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginApplicant } from "../../actions";

// Update the ActionResponse type to include new fields
interface ActionResponse {
  success: boolean;
  message: string;
  requiresVerification?: boolean;
  verificationType?: "email" | "phone";
  identifier?: string;
  redirectUrl?: string;
}

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

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);

    try {
      // Create FormData object to match server action signature
      const formData = new FormData();
      formData.append("identifier", values.identifier);
      formData.append("password", values.password);
      formData.append("callbackUrl", searchParams.get("callbackUrl") || "/");

      // Call server action
      const result = (await loginApplicant(formData)) as ActionResponse;

      if (result.success && result.redirectUrl) {
        toast.success("Login successful");
        router.push(result.redirectUrl);
        router.refresh();
      } else if (result.requiresVerification && result.identifier) {
        // Handle unverified account gracefully
        toast.message("Please verify your account", {
          description: "You need to verify your account before logging in",
        });
        router.push(
          `/verify?${result.verificationType}=${encodeURIComponent(result.identifier)}`
        );
      } else {
        toast.error("Login failed", {
          description: result.message || "Please try again",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
