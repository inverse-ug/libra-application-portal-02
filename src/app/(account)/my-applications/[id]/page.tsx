"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getApplicationById } from "@/app/actions/application-actions";
import {
  generateApplicationPDF,
  printApplication,
} from "@/app/actions/pdf-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  Printer,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function ApplicationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true);
        const data = await getApplicationById(params.id);
        setApplication(data);
      } catch (error) {
        console.error("Error fetching application:", error);
        setError("Failed to load application details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [params.id]);

  const handleDownloadPDF = async () => {
    try {
      setIsPdfGenerating(true);
      setError(null);
      setSuccessMessage(null);

      const result = await generateApplicationPDF(params.id);

      if (result.success && result.url) {
        // Open the PDF in a new tab
        window.open(result.url, "_blank");
        setSuccessMessage(
          "PDF generated successfully. It should download automatically."
        );
      } else {
        setError(result.message || "Failed to generate PDF. Please try again.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      setError(null);
      setSuccessMessage(null);

      const result = await printApplication(params.id);

      if (result.success) {
        // Generate the PDF URL
        const pdfUrl = `/api/pdf/${params.id}`;

        // Open the PDF in a new window and print it
        const printWindow = window.open(pdfUrl, "_blank");

        if (printWindow) {
          printWindow.addEventListener("load", () => {
            printWindow.print();
            setSuccessMessage("Print request sent successfully.");
          });
        } else {
          setError(
            "Unable to open print window. Please check your popup blocker settings."
          );
        }
      } else {
        setError(
          result.message || "Failed to process print request. Please try again."
        );
      }
    } catch (error) {
      console.error("Error printing application:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ||
              "The application you are looking for does not exist or has been removed."}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/my-applications">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Applications
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300">
            Draft
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300">
            Submitted
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Under Review
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300">
            Accepted
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300">
            Rejected
          </Badge>
        );
      case "ENROLLED":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 border-purple-300">
            Enrolled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/my-applications">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to My Applications</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Application Details</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={handlePrint}
            disabled={isPrinting}>
            {isPrinting ? (
              <>Processing...</>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" /> Print
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={handleDownloadPDF}
            disabled={isPdfGenerating}>
            {isPdfGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </>
            )}
          </Button>
          {application.status === "DRAFT" && (
            <Button
              size="sm"
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700"
              onClick={() => router.push(`/apply/${application.id}`)}>
              Continue Application
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 rounded-lg bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-xl shadow-sm mb-6">
        <CardHeader className="pb-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle className="text-xl">
                Application #{application.id.substring(0, 8)}
              </CardTitle>
              <CardDescription>
                Created on {formatDate(application.createdAt)} • Last updated on{" "}
                {formatDate(application.updatedAt)}
              </CardDescription>
            </div>
            <div>{getStatusBadge(application.status)}</div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="grid grid-cols-3 md:w-[400px] rounded-lg">
              <TabsTrigger value="details" className="rounded-md">
                Details
              </TabsTrigger>
              <TabsTrigger value="program" className="rounded-md">
                Program
              </TabsTrigger>
              <TabsTrigger value="progress" className="rounded-md">
                Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Applicant
                  </h3>
                  <p className="font-medium">
                    {application.applicant.firstName}{" "}
                    {application.applicant.middleName}{" "}
                    {application.applicant.surname}
                  </p>
                  <p>{application.applicant.email}</p>
                  <p>{application.applicant.phone}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Application Type
                  </h3>
                  <p className="font-medium">
                    {application.isShortCourse
                      ? `Short Course (${application.shortCourseDuration})`
                      : "Regular Program"}
                  </p>
                  {application.intake && (
                    <>
                      <h3 className="text-sm font-medium text-muted-foreground mt-4">
                        Intake
                      </h3>
                      <p className="font-medium">{application.intake.name}</p>
                      <p>
                        {formatDate(application.intake.startDate)} -{" "}
                        {formatDate(application.intake.endDate)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {application.payment && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">
                        {formatCurrency(application.payment.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {application.payment.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-medium">
                        {application.payment.method}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="program" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Program
                </h3>
                <p className="font-medium">{application.program.title}</p>
                <p>{application.program.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{application.program.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{application.program.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tuition Fee</p>
                  <p className="font-medium">
                    {formatCurrency(application.program.tuitionFee)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requirements</p>
                  <p className="font-medium">
                    {application.program.requirements}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Application Progress
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${application.progress}%` }}></div>
                </div>
                <p className="text-sm text-right">
                  {application.progress}% Complete
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Completed Steps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-4 w-4 rounded-full ${
                        application.personalInfoComplete
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}></div>
                    <p>Personal Information</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-4 w-4 rounded-full ${
                        application.educationComplete
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}></div>
                    <p>Education History</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-4 w-4 rounded-full ${
                        application.programInfoComplete
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}></div>
                    <p>Program Information</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-4 w-4 rounded-full ${
                        application.documentsComplete
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}></div>
                    <p>Documents</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-4 w-4 rounded-full ${
                        application.declarationComplete
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}></div>
                    <p>Declaration</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t p-4 flex justify-end">
          <Button variant="outline" asChild className="rounded-lg">
            <Link href="/my-applications">Back to Applications</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
