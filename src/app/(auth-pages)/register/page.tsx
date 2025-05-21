import type { Metadata } from "next";
import AuthFlow from "@/components/auth-flow";

export const metadata: Metadata = {
  title: "Register | Libra Vocational and Business Institute",

  description: "Join the Libra Vicational and Business Institudte.",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <AuthFlow />
    </main>
  );
}
