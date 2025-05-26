import { Suspense } from "react";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import ResetPasswordForm from "./_components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Libra Vocational and Business Institute",
  description:
    "Reset your password with the verification code sent to your email",
};

function ResetPasswordLoading() {
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

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-0">
          <Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
