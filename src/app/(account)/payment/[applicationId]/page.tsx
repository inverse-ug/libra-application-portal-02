import type { Metadata } from "next";
import PaymentPage from "./PaymentPage";

export const metadata: Metadata = {
  title: "Payment | Application Portal",
  description: "Complete your application payment",
};

export default async function Payment({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  return (
    <main className="min-h-screen bg-background">
      <PaymentPage applicationId={applicationId} />
    </main>
  );
}
