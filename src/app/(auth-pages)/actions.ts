"use server";

import {
  formatUgandanPhoneNumber,
  generateVerificationCode,
  sendSMS,
  sendVerificationEmail,
  createVerificationToken,
  createPasswordResetToken,
  sendPasswordResetEmail,
  hashPassword,
} from "@/lib/auth-utils";
import { signIn } from "../../auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

type FormDataEntry = string | null;

interface ActionResponse {
  success: boolean;
  message: string;
  requiresVerification?: boolean;
  verificationType?: "email" | "phone";
  identifier?: string;
  redirectUrl?: string;
}

function validateFormFields(fields: Record<string, FormDataEntry>): void {
  for (const [field, value] of Object.entries(fields)) {
    if (!value) {
      throw new Error(`${field} is required`);
    }
  }
}

export async function registerApplicantEmail(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    validateFormFields({ name, email, password });

    const existingApplicant = await prisma.applicant.findUnique({
      where: { email },
    });

    if (existingApplicant) {
      throw new Error("An account already exists with this email");
    }

    const hashedPassword = await hashPassword(password);
    await prisma.applicant.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const verificationToken = await createVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);

    return {
      success: true,
      message:
        "Registration successful! Check your email for the 6-digit verification code.",
      requiresVerification: true,
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.message || "Registration failed. Please try again.",
    };
  }
}

export async function registerApplicantPhone(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const program = formData.get("program") as string;

    validateFormFields({ name, phone, password, program });

    const formattedPhone = formatUgandanPhoneNumber(phone);

    const existingApplicant = await prisma.applicant.findUnique({
      where: { phone: formattedPhone },
    });

    if (existingApplicant) {
      throw new Error("An account already exists with this phone number");
    }

    const hashedPassword = await hashPassword(password);
    await prisma.applicant.create({
      data: {
        name,
        phone: formattedPhone,
        password: hashedPassword,
      },
    });

    const verificationCode = generateVerificationCode();
    await prisma.verificationToken.create({
      data: {
        identifier: formattedPhone,
        token: verificationCode,
        expires: new Date(Date.now() + 3600000),
      },
    });
    await sendSMS(
      formattedPhone,
      `Your Libra verification code: ${verificationCode}`
    );

    return {
      success: true,
      message:
        "Registration successful! Check your phone for the 6-digit verification code.",
      requiresVerification: true,
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.message.includes("Ugandan phone number")
        ? "Please enter a valid Ugandan number (e.g., 0755123456)"
        : error.message || "Registration failed. Please try again.",
    };
  }
}

export async function verifyCode(code: string): Promise<ActionResponse> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: code },
    });

    if (!verificationToken) {
      throw new Error("Invalid verification code");
    }

    if (new Date(verificationToken.expires) < new Date()) {
      throw new Error("Verification code has expired");
    }

    const isEmail = verificationToken.identifier.includes("@");

    if (isEmail) {
      await prisma.$transaction([
        prisma.applicant.updateMany({
          where: { email: verificationToken.identifier },
          data: { emailVerified: new Date() },
        }),
        prisma.verificationToken.delete({
          where: { token: code },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.applicant.updateMany({
          where: { phone: verificationToken.identifier },
          data: { phoneVerified: new Date() },
        }),
        prisma.verificationToken.delete({
          where: { token: code },
        }),
      ]);
    }

    return {
      success: true,
      message: "Account verified successfully! You can now log in.",
    };
  } catch (error: any) {
    console.error("Verification error:", error);
    return {
      success: false,
      message: error.message || "Verification failed. Please try again.",
    };
  }
}

export async function resendVerificationCode(
  identifier: string
): Promise<ActionResponse> {
  try {
    // Delete any existing verification tokens for this identifier
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    const isEmail = identifier.includes("@");

    if (isEmail) {
      const verificationToken = await createVerificationToken(identifier);
      await sendVerificationEmail(identifier, verificationToken.token);

      return {
        success: true,
        message: "New verification code sent to your email!",
      };
    } else {
      const verificationCode = generateVerificationCode();
      await prisma.verificationToken.create({
        data: {
          identifier,
          token: verificationCode,
          expires: new Date(Date.now() + 3600000), // 1 hour
        },
      });
      await sendSMS(identifier, `Your verification code: ${verificationCode}`);

      return {
        success: true,
        message: "New verification code sent to your phone!",
      };
    }
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      message: error.message || "Failed to resend verification code.",
    };
  }
}

// Updated loginApplicant function in actions.ts
export async function loginApplicant(
  formData: FormData
): Promise<ActionResponse> {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    // Server-side validation
    if (!identifier || !password) {
      return {
        success: false,
        message: "Please provide both email/phone and password",
      };
    }

    // Check if identifier is email or phone
    const isEmail = identifier.includes("@");
    let user = null;

    if (isEmail) {
      user = await prisma.applicant.findUnique({
        where: { email: identifier },
      });
    } else {
      try {
        const formattedPhone = formatUgandanPhoneNumber(identifier);
        user = await prisma.applicant.findUnique({
          where: { phone: formattedPhone },
        });
      } catch (error) {
        return {
          success: false,
          message:
            "Please enter a valid Ugandan phone number (e.g., 0755123456)",
        };
      }
    }

    if (!user) {
      return {
        success: false,
        message: isEmail
          ? "No account found with this email"
          : "No account found with this phone number",
      };
    }

    // Check if user is verified (email or phone)
    if (isEmail) {
      if (!user.emailVerified) {
        return {
          success: false,
          message: "Your account needs to be verified",
          requiresVerification: true,
          verificationType: "email",
          identifier: identifier,
        };
      }
    } else {
      if (!user.phoneVerified) {
        return {
          success: false,
          message: "Your account needs to be verified",
          requiresVerification: true,
          verificationType: "phone",
          identifier: identifier,
        };
      }
    }

    // Attempt login with NextAuth
    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("NextAuth error:", result.error);
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      // Return success with redirect URL
      return {
        success: true,
        message: "Login successful",
        redirectUrl: callbackUrl,
      };
    } catch (signInError) {
      console.error("Sign in error:", signInError);
      return {
        success: false,
        message: "Authentication failed",
      };
    }
  } catch (error: any) {
    console.error("Login error:", error);

    if (error instanceof AuthError) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }

    return {
      success: false,
      message: error.message || "Authentication failed",
    };
  }
}

export async function requestPasswordReset(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const email = formData.get("email") as string;

    if (!email) {
      throw new Error("Email is required");
    }

    const applicant = await prisma.applicant.findUnique({
      where: { email },
    });

    if (!applicant) {
      throw new Error("No account found with this email");
    }

    const resetToken = await createPasswordResetToken(email);
    await sendPasswordResetEmail(email, resetToken.token);

    return {
      success: true,
      message: "Password reset code sent to your email",
    };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return {
      success: false,
      message: error.message || "Failed to send reset code",
    };
  }
}

export async function resetPassword(
  token: string,
  password: string
): Promise<ActionResponse> {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new Error("Invalid reset code");
    }

    if (new Date(resetToken.expires) < new Date()) {
      throw new Error("Reset code has expired");
    }

    const hashedPassword = await hashPassword(password);
    await prisma.$transaction([
      prisma.applicant.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    return {
      success: true,
      message:
        "Password updated successfully. You can now log in with your new password.",
    };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return {
      success: false,
      message: error.message || "Failed to reset password",
    };
  }
}
