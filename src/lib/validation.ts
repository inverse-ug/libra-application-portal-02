import { z } from "zod";

export const accountSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const verificationSchema = z.object({
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  otherNames: z.string().min(1, "Other names are required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export const schoolSelectionSchema = z.object({
  schoolId: z.string().min(1, "Please select a school"),
});
