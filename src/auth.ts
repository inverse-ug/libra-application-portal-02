import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { formatUgandanPhoneNumber } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Applicant } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      role: string;
      applicationStatus?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    email?: string | null;
    phone?: string | null;
    applicationStatus?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email/Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials.password) {
            return null;
          }

          let isEmail = false;
          let user: Applicant | null = null;

          // Try as email first
          isEmail = true;
          user = await prisma.applicant.findUnique({
            where: { email: credentials.identifier as string },
          });

          // If not found as email, try as phone
          if (!user) {
            isEmail = false;
            const formattedPhone = formatUgandanPhoneNumber(
              credentials.identifier as string
            );
            user = await prisma.applicant.findUnique({
              where: { phone: formattedPhone },
            });
          }

          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            return null;
          }

          // Only return user if they are verified (verification check done in server action)
          if (isEmail && !user.emailVerified) {
            return null;
          }

          if (!isEmail && !user.phoneVerified) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role || "applicant",
          };
        } catch (error: any) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
    verifyRequest: "/verify",
    error: "/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "applicant";
        token.email = user.email;
        token.phone = user.phone;
        token.applicationStatus = (user as any).applicationStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email ?? "";
        session.user.phone = token.phone;
        session.user.applicationStatus = token.applicationStatus;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        await prisma.applicant.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginAttempts: 0,
          },
        });
      } catch (error) {
        console.error("Failed to update last login:", error);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
});
