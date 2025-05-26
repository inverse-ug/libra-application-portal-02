"use server";

import { signIn } from "@/auth"; // Your NextAuth config
import { prisma } from "@/lib/prisma";
import { formatUgandanPhoneNumber } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";
import { z } from "zod";

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

export type LoginResult = {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
  verificationType?: "email" | "phone";
  identifier?: string;
};

export async function loginAction(
  prevState: LoginResult | null,
  formData: FormData
): Promise<LoginResult> {
  try {
    // Validate form data
    const validatedFields = loginSchema.safeParse({
      identifier: formData.get("identifier"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    const { identifier, password } = validatedFields.data;

    // Check user exists and get verification status
    let user = null;
    let isEmail = identifier.includes("@");

    if (isEmail) {
      user = await prisma.applicant.findUnique({
        where: { email: identifier },
        select: {
          id: true,
          email: true,
          phone: true,
          password: true,
          emailVerified: true,
          phoneVerified: true,
        },
      });
    } else {
      const formattedPhone = formatUgandanPhoneNumber(identifier);
      user = await prisma.applicant.findUnique({
        where: { phone: formattedPhone },
        select: {
          id: true,
          email: true,
          phone: true,
          password: true,
          emailVerified: true,
          phoneVerified: true,
        },
      });
    }

    if (!user) {
      return {
        success: false,
        error:
          "No account found with these credentials.Please Register for an account.",
      };
    }

    if (!user.password) {
      return {
        success: false,
        error: "Wrong Password. Please try again.",
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        success: false,
        error: "Invalid credentials. Please try again.",
      };
    }

    // Check verification status
    if (isEmail && !user.emailVerified) {
      return {
        success: false,
        needsVerification: true,
        verificationType: "email",
        identifier: user.email!,
        error: "Please verify your email before logging in",
      };
    }

    if (!isEmail && !user.phoneVerified) {
      return {
        success: false,
        needsVerification: true,
        verificationType: "phone",
        identifier: user.phone!,
        error: "Please verify your phone before logging in",
      };
    }

    // User is verified, attempt to sign in
    try {
      const callbackUrl = "/"; // You can pass this as a parameter if needed
      await signIn("credentials", {
        identifier,
        password,
        redirectTo: callbackUrl,
      });

      // Update last login
      await prisma.applicant.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          loginAttempts: 0,
        },
      });

      return { success: true };
    } catch (error: any) {
      // Ignore NEXT_REDIRECT error and proceed as if login succeeded
      if (
        error?.digest &&
        typeof error.digest === "string" &&
        error.digest.startsWith("NEXT_REDIRECT")
      ) {
        return { success: true };
      }
      throw error;
    }
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// Alternative function for checking verification status only
export async function checkVerificationStatus(identifier: string): Promise<{
  needsVerification: boolean;
  verificationType?: "email" | "phone";
  userIdentifier?: string;
}> {
  try {
    let user = null;
    let isEmail = identifier.includes("@");

    if (isEmail) {
      user = await prisma.applicant.findUnique({
        where: { email: identifier },
        select: { emailVerified: true, email: true },
      });
    } else {
      const formattedPhone = formatUgandanPhoneNumber(identifier);
      user = await prisma.applicant.findUnique({
        where: { phone: formattedPhone },
        select: { phoneVerified: true, phone: true },
      });
    }

    if (!user) {
      return { needsVerification: false };
    }

    const needsVerification = isEmail
      ? !user.emailVerified
      : !user.phoneVerified;

    return {
      needsVerification,
      verificationType: isEmail ? "email" : "phone",
      userIdentifier: isEmail ? user.email! : user.phone!,
    };
  } catch (error) {
    console.error("Verification check error:", error);
    return { needsVerification: false };
  }
}
