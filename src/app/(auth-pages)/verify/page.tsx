import { Loader } from "lucide-react";
import { Suspense } from "react";
import VerificationForm from "./verification-account-form";

// Loading component to show while the content is loading
function VerificationFormLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Verify Your Account</h1>
      <div className="flex justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    </div>
  );
}

// Main component that wraps the form in a Suspense boundary
export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<VerificationFormLoading />}>
      <VerificationForm />
    </Suspense>
  );
}
