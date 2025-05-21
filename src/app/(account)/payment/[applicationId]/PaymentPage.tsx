"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { processPayment } from "@/app/actions/payment-actions";
import { toast } from "sonner";

export default function PaymentPage({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"mtn" | "airtel" | "card">(
    "mtn"
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentReference: string;
    paymentDate: Date;
  } | null>(null);

  const handlePayment = async () => {
    if (
      !phoneNumber &&
      (paymentMethod === "mtn" || paymentMethod === "airtel")
    ) {
      toast.error("Phone number required", {
        description:
          "Please enter your phone number to proceed with mobile money payment",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Process payment using server action
      const result = await processPayment({
        applicationId,
        paymentMethod,
        phoneNumber:
          paymentMethod === "mtn" || paymentMethod === "airtel"
            ? phoneNumber
            : undefined,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      if (
        result.data &&
        result.data.paymentReference &&
        result.data.paymentDate
      ) {
        setPaymentDetails({
          paymentReference: result.data.paymentReference,
          paymentDate: result.data.paymentDate,
        });
      } else {
        setPaymentDetails(null);
      }
      setIsComplete(true);

      toast.success("Payment successful", {
        description: "Your application fee has been paid successfully",
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/my-applications");
      }, 3000);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Payment failed", {
        description:
          error.message ||
          "There was an error processing your payment. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="h-6 w-6 mr-2" />
              Payment Successful
            </CardTitle>
            <CardDescription>
              Your application fee has been paid successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Payment Confirmed</AlertTitle>
              <AlertDescription>
                Your payment has been processed successfully. You will be
                redirected to your applications page.
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span>Payment Reference:</span>
                <span className="font-medium">
                  {paymentDetails?.paymentReference || "-"}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Payment Method:</span>
                <span className="font-medium capitalize">{paymentMethod}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Date:</span>
                <span className="font-medium">
                  {paymentDetails?.paymentDate
                    ? new Date(paymentDetails.paymentDate).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Amount Paid:</span>
                <span>UGX 50,000</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.push("/my-applications")}
              className="w-full">
              Go to My Applications
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button
        variant="outline"
        size="sm"
        className="mb-6"
        onClick={() => router.back()}
        disabled={isProcessing}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Application Fee Payment</CardTitle>
          <CardDescription>
            Pay the application fee to complete your submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Payment Summary</h3>
              <Separator className="mb-4" />

              <div className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Application Fee</span>
                  <span>UGX 50,000</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>UGX 50,000</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                Select Payment Method
              </h3>
              <Separator className="mb-4" />

              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "mtn" | "airtel" | "card")
                }
                className="space-y-3">
                <div className="border rounded-lg p-4 transition-colors hover:border-primary">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mtn" id="mtn" />
                    <Label htmlFor="mtn" className="flex-1 cursor-pointer">
                      <div className="font-medium">MTN Mobile Money</div>
                      <div className="text-sm text-muted-foreground">
                        Pay with MTN Mobile Money
                      </div>
                    </Label>
                  </div>
                  {paymentMethod === "mtn" && (
                    <div className="mt-3 pl-6">
                      <Label
                        htmlFor="mtn-number"
                        className="text-sm mb-1 block">
                        MTN Mobile Money Number
                      </Label>
                      <Input
                        id="mtn-number"
                        placeholder="e.g. 0771234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-4 transition-colors hover:border-primary">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="airtel" id="airtel" />
                    <Label htmlFor="airtel" className="flex-1 cursor-pointer">
                      <div className="font-medium">Airtel Money</div>
                      <div className="text-sm text-muted-foreground">
                        Pay with Airtel Money
                      </div>
                    </Label>
                  </div>
                  {paymentMethod === "airtel" && (
                    <div className="mt-3 pl-6">
                      <Label
                        htmlFor="airtel-number"
                        className="text-sm mb-1 block">
                        Airtel Money Number
                      </Label>
                      <Input
                        id="airtel-number"
                        placeholder="e.g. 0701234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-4 transition-colors hover:border-primary">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-muted-foreground">
                        Pay with Visa, Mastercard or other cards
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <Button
            onClick={handlePayment}
            className="w-full"
            disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay UGX 50,000
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Your payment information is secure and encrypted. By proceeding with
            the payment, you agree to our terms and conditions.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
