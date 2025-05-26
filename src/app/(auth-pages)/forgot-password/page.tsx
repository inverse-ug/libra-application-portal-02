import { Suspense } from "react";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import ForgotPasswordForm from "./_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | Libra Vocational and Business Institute",
  description: "Reset your password by entering your email address",
};

// Loading component for Suspense fallback
function ForgotPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-0">
          <Suspense fallback={<ForgotPasswordLoading />}>
            <ForgotPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
