import type { Metadata } from "next";
import PaymentPage from "./PaymentPage";

export const metadata: Metadata = {
  title: "Payment | Application Portal",
  description: "Complete your application payment",
};

interface PaymentPageParams {
  params: {
    id: string;
  };
}

export default function Payment({ params }: PaymentPageParams) {
  return (
    <main className="min-h-screen bg-background">
      <PaymentPage applicationId={params.id} />
    </main>
  );
}
