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
import { Eye, EyeOff, Loader, Check, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { registerApplicantEmail, registerApplicantPhone } from "../../actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const phoneRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(
        /^(\+256|0)[0-9]{9}$/,
        "Must be a valid Ugandan phone number (0XXX or +256XXX)"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const emailRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailForm = useForm<z.infer<typeof emailRegisterSchema>>({
    resolver: zodResolver(emailRegisterSchema),
    defaultValues: {
      name: "",
      email: searchParams?.get("email") || "",
      password: "",
      confirmPassword: "",
    },
  });

  const phoneForm = useForm<z.infer<typeof phoneRegisterSchema>>({
    resolver: zodResolver(phoneRegisterSchema),
    defaultValues: {
      name: "",
      phone: searchParams?.get("phone") || "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch password fields for strength indicator
  const emailPassword = emailForm.watch("password");
  const phonePassword = phoneForm.watch("password");

  const onSubmitEmail = async (values: z.infer<typeof emailRegisterSchema>) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);

      const result = await registerApplicantEmail(formData);

      if (result.success) {
        toast.success("Registration successful!");
        document.dispatchEvent(new Event("startNavigation"));
        router.push(`/verify?email=${encodeURIComponent(values.email)}`);
      } else {
        toast.error("Registration failed", {
          description: result.message || "Please try again",
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPhone = async (values: z.infer<typeof phoneRegisterSchema>) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone);
      formData.append("password", values.password);

      const result = await registerApplicantPhone(formData);

      if (result.success) {
        toast.success("Registration successful!");
        router.push(`/verify?phone=${encodeURIComponent(values.phone)}`);
      } else {
        toast.error("Registration failed", {
          description: result.message || "Please try again",
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-2 py-8 sm:p-8">
      <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6 w-full">
          <TabsTrigger value="email">Register with Email</TabsTrigger>
          <TabsTrigger value="phone">Register with Phone</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onSubmitEmail)}
              className="space-y-4">
              <FormField
                control={emailForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        autoComplete="name"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
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

              <FormField
                control={emailForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
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
                        <PasswordStrengthIndicator
                          password={emailPassword || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
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

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="phone">
          <Form {...phoneForm}>
            <form
              onSubmit={phoneForm.handleSubmit(onSubmitPhone)}
              className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        autoComplete="name"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0755123456 or +256755123456"
                        {...field}
                        autoComplete="tel"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={phoneForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
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
                        <PasswordStrengthIndicator
                          password={phonePassword || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={phoneForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
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

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
