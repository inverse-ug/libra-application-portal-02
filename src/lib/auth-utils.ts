import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { VerificationEmail } from "@/components/emails/verification-email";
import { PasswordResetEmail } from "@/components/emails/password-reset-email";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const formatUgandanPhoneNumber = (phone: string): string => {
  if (!phone) throw new Error("Phone number is required for application");

  let cleaned = phone.replace(/[^\d+]/g, "");

  // Handle common Ugandan formats
  if (cleaned.startsWith("0")) {
    cleaned = `+256${cleaned.substring(1)}`;
  } else if (/^256/.test(cleaned) && !cleaned.startsWith("+")) {
    cleaned = `+${cleaned}`;
  } else if (/^7[0-9]{8}$/.test(cleaned)) {
    cleaned = `+256${cleaned}`;
  } else if (/^[0-9]{9,12}$/.test(cleaned)) {
    cleaned = `+${cleaned}`;
  }

  if (!/^\+256[17]\d{8}$/.test(cleaned)) {
    throw new Error(
      "Please enter a valid Ugandan phone number (e.g., 0755123456 or +256755123456)"
    );
  }

  return cleaned;
};

export const isValidUgandanPhoneNumber = (phone: string): boolean => {
  try {
    formatUgandanPhoneNumber(phone);
    return true;
  } catch {
    return false;
  }
};

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendSMS = async (
  phoneNumber: string,
  message: string,
  retries = 2
): Promise<boolean> => {
  try {
    const formattedNumber = formatUgandanPhoneNumber(phoneNumber);

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: formattedNumber,
        message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send SMS");
    }

    return true;
  } catch (error: any) {
    console.error("SMS send error:", error.message);
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return sendSMS(phoneNumber, message, retries - 1);
    }
    return false;
  }
};

export const sendVerificationEmail = async (email: string, code: string) => {
  const emailHtml = await render(VerificationEmail({ verificationCode: code }));

  return resend.emails.send({
    from: `Libra Admissions <admissions@${process.env.EMAIL_DOMAIN}>`,
    to: email,
    subject: "Verify Your Email - Libra Institute Application",
    html: emailHtml,
  });
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
  const emailHtml = await render(PasswordResetEmail({ resetCode: code }));

  return resend.emails.send({
    from: `Libra Support <support@${process.env.EMAIL_DOMAIN}>`,
    to: email,
    subject: "Password Reset - Libra Application Portal",
    html: emailHtml,
  });
};

export const createVerificationToken = async (identifier: string) => {
  const token = generateVerificationCode();
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  return prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });
};

export const createPasswordResetToken = async (email: string) => {
  const token = generateVerificationCode();
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  return prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });
};

export const hashPassword = async (password: string): Promise<string> => {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  return bcrypt.hash(password, 12);
};
