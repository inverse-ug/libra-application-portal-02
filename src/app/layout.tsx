import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import NextTopLoader from "@/components/next-top-loader";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider"; // You'll need to create this

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Libra Vocational and Business Institute Application Portal",
  description:
    "Apply for admission to the Libra Vocational and Business Institute",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <SessionProvider>
            <Suspense>
              <NextTopLoader />
            </Suspense>
            {children}
            <Toaster richColors position="top-center" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
