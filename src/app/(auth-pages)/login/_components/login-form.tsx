"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader } from "lucide-react";
import { loginAction } from "../actions";

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
      // Create FormData from the form values
      const formData = new FormData();
      formData.append("identifier", values.identifier);
      formData.append("password", values.password);

      // Call the server action
      const result = await loginAction(null, formData);

      if (result.success) {
        toast.success("Login successful");
        document.dispatchEvent(new Event("startNavigation"));
        const callbackUrl = searchParams.get("callbackUrl") || "/";
        router.push(callbackUrl);
        router.refresh();
      } else if (result.needsVerification) {
        toast.message("Account Verification Required", {
          description: "You need to verify your account before logging in",
        });

        const verificationType = result.verificationType;
        const identifier = result.identifier;

        if (verificationType && identifier) {
          router.push(
            `/verify?${verificationType}=${encodeURIComponent(identifier)}`
          );
          document.dispatchEvent(new Event("startNavigation"));
        }
      } else if (result.error) {
        toast.error(result.error);
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
