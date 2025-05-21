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
  User,
  GraduationCap,
  FileText,
  Users,
  Clipboard,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

  const generatePDF = async (applicationData: any) => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();

      // Set document properties
      doc.setProperties({
        title: `Application Form - ${applicationData.applicant.firstName} ${applicationData.applicant.surname}`,
        subject: "Application Form",
        author: "Libra Vocational and Business Institute",
        keywords: "application, form, libra",
        creator: "Libra Portal",
      });

      // Add header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Skills For Excellence", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("P.O Box 120466, Kampala", 105, 22, { align: "center" });
      doc.text("Tel: +256 393 247 785", 105, 27, { align: "center" });
      doc.text("Mob: +256 772 434 509", 105, 32, { align: "center" });
      doc.text("Email: Info@libravoctional.com", 105, 37, { align: "center" });
      doc.text("Website: libravocational.com", 105, 42, { align: "center" });

      // Add title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("OFFICE OF THE ACADEMIC REGISTRAR", 105, 52, {
        align: "center",
      });
      doc.text("APPLICATION FORM FOR DIPLOMA /CERTIFICATE PROGRAMME", 105, 60, {
        align: "center",
      });

      // Add application fee note
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "This form must be submitted with evidence of payment of application fee of",
        105,
        70,
        {
          align: "center",
        }
      );
      doc.text(
        "Fifty Thousand shillings (Shs 50,000/=). (Non-refundable)",
        105,
        75,
        { align: "center" }
      );

      // Add date
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 85);

      // Add personal details section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Applicant's personal details:", 20, 95);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `First Name: ${applicationData.applicant.firstName || "_________________"}`,
        20,
        105
      );
      doc.text(
        `Middle Name: ${applicationData.applicant.middleName || "_________________"}`,
        105,
        105
      );
      doc.text(
        `SurName: ${applicationData.applicant.surname || "_________________"}`,
        20,
        115
      );
      doc.text(
        "(Names should be those that appear on your academic documents).",
        20,
        125
      );

      const dob = applicationData.applicant.dateOfBirth
        ? new Date(applicationData.applicant.dateOfBirth).toLocaleDateString()
        : "____________";
      doc.text(`Date of birth: ${dob} (DD/MM/YY)`, 20, 135);

      doc.text(
        `Gender: ${applicationData.applicant.gender === "male" ? "✓" : ""}  M   ${applicationData.applicant.gender === "female" ? "✓" : ""}  F`,
        105,
        135
      );
      doc.text(
        `Nationality: ${applicationData.applicant.nationality || "_________________"}`,
        20,
        145
      );
      doc.text(
        `Physical address: ${applicationData.applicant.physicalAddress || "_________________"}`,
        20,
        155
      );
      doc.text(
        `Tel No: ${applicationData.applicant.phone || "_________________"}`,
        20,
        165
      );

      // Add page break
      doc.addPage();

      // Add header to new page
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Skills For Excellence", 105, 15, { align: "center" });

      // Add program details section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Program Details", 20, 30);
      doc.text("Program Applied For:", 20, 40);

      // Create program checkboxes
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Column headers
      doc.setFont("helvetica", "bold");
      doc.text("DIPLOMA COURSES", 50, 50, { align: "center" });
      doc.text("NATIONAL CERTIFICATE COURSES", 150, 50, { align: "center" });
      doc.setFont("helvetica", "normal");

      const diplomaCourses = [
        "INFORMATION TECHNOLOGY",
        "COSMETOLOGY AND BEAUTY THERAPY",
        "FASHION AND GARMENT DESIGN",
        "ELECTRICAL ENGINEERING",
        "WATER ENGINEERING",
        "BUILDING AND CIVIL ENGINEERING",
        "INSTITUTIONAL CATERING AND HOTEL MANAGEMENT",
        "MECHANICAL ENGINEERING",
        "HOME BASED CARE NURSING",
      ];

      const certificateCourses = [
        "INFORMATION TECHNOLOGY",
        "COSMETOLOGY AND BEAUTY THERAPY",
        "FASHION AND GARMENT DESIGN",
        "ELECTRICAL INSTALL SYSTEMS AND MAINTENANCE",
        "PLUMBING",
        "BUILDING CONSTRUCTION",
        "INSTITUTIONAL CATERING AND HOTEL MANAGEMENT",
        "AUTOMOTIVE MECHANICS",
        "HOME BASED CARE NURSING",
      ];

      // Determine which program is selected
      const selectedProgram = applicationData.program.title.toUpperCase();

      // Draw checkboxes and program names
      let yPos = 60;
      for (let i = 0; i < diplomaCourses.length; i++) {
        // Diploma courses
        doc.rect(20, yPos - 4, 4, 4); // Checkbox
        if (
          selectedProgram.includes(diplomaCourses[i]) &&
          !applicationData.isShortCourse
        ) {
          doc.text("✓", 21, yPos); // Checkmark
        }
        doc.text(diplomaCourses[i], 30, yPos);

        // Certificate courses
        doc.rect(120, yPos - 4, 4, 4); // Checkbox
        if (
          selectedProgram.includes(certificateCourses[i]) &&
          !applicationData.isShortCourse
        ) {
          doc.text("✓", 121, yPos); // Checkmark
        }
        doc.text(certificateCourses[i], 130, yPos);

        yPos += 10;
      }

      // Add short courses section
      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text("SHORT COURSES:", 20, yPos);
      yPos += 10;
      doc.setFont("helvetica", "normal");
      doc.text(
        "The institute offers short none-formal training 3-6 months in all the",
        20,
        yPos
      );
      yPos += 5;
      doc.text("above courses.", 20, yPos);

      // Check if it's a short course
      if (applicationData.isShortCourse) {
        yPos += 5;
        doc.text("✓", 21, yPos); // Checkmark
      }

      // Add page break
      doc.addPage();

      // Add header to new page
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Skills For Excellence", 105, 15, { align: "center" });

      // Add educational background section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Educational Background of the Applicant", 20, 30);
      doc.setFontSize(10);
      doc.text(
        "(Primary, Secondary schools, colleges and Universities)",
        20,
        40
      );

      // Create education table
      const educationHeaders = [
        { header: "NAME OF THE SCHOOLS ATTENDED", dataKey: "school" },
        { header: "FROM", dataKey: "from" },
        { header: "TO", dataKey: "to" },
        {
          header: "QUALIFICATION OBTAINED (PLE, UCE, UACE, CERTIFICATE) etc.",
          dataKey: "qualification",
        },
      ];

      const educationData =
        applicationData.applicant.educationHistory?.map((edu: any) => ({
          school: edu.institution,
          from: edu.startYear,
          to: edu.endYear || "Present",
          qualification: edu.qualification,
        })) || [];

      // Add empty rows if needed
      while (educationData.length < 5) {
        educationData.push({ school: "", from: "", to: "", qualification: "" });
      }

      autoTable(doc, {
        startY: 45,
        head: [educationHeaders.map((h) => h.header)],
        body: educationData.map((d) => [
          d.school,
          d.from,
          d.to,
          d.qualification,
        ]),
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 20, halign: "center" },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 80 },
        },
      });

      // Add sponsor details
      let sponsorY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Details of Parent/Guardian/Sponsor", 20, sponsorY);
      sponsorY += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Name: ${applicationData.applicant.sponsorName || "______________"}`,
        20,
        sponsorY
      );
      doc.text(
        `Relationship: ${applicationData.applicant.sponsorRelationship || "_______"}`,
        80,
        sponsorY
      );
      doc.text(
        `Occupation: ${applicationData.applicant.sponsorOccupation || "________"}`,
        140,
        sponsorY
      );
      sponsorY += 10;

      doc.text(
        `Physical Address: ${applicationData.applicant.sponsorAddress || "_________________"}`,
        20,
        sponsorY
      );
      doc.text(
        `Tel No.: ${applicationData.applicant.sponsorPhone || "_________________"}`,
        120,
        sponsorY
      );
      sponsorY += 10;

      doc.text("Signature: ______________________", 20, sponsorY);

      // Add next of kin details
      let kinY = sponsorY + 20;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Details of Next of Kin", 20, kinY);
      kinY += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Name: ${applicationData.applicant.nextOfKinName || "______________"}`,
        20,
        kinY
      );
      doc.text(
        `Relationship: ${applicationData.applicant.nextOfKinRelationship || "_______"}`,
        80,
        kinY
      );
      doc.text(
        `Occupation: ${applicationData.applicant.nextOfKinOccupation || "________"}`,
        140,
        kinY
      );
      kinY += 10;

      doc.text(
        `Physical Address: ${applicationData.applicant.nextOfKinAddress || "_________________"}`,
        20,
        kinY
      );
      doc.text(
        `Tel No.: ${applicationData.applicant.nextOfKinPhone || "_________________"}`,
        120,
        kinY
      );
      kinY += 10;

      doc.text("Signature: ______________________", 20, kinY);

      // Add note about documents
      let noteY = kinY + 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Note:", 20, noteY);
      noteY += 5;

      doc.setFont("helvetica", "normal");
      doc.text(
        "• Attach copies of relevant documents i.e., Academic Documents (PLE, UCE, UACE), National Id",
        25,
        noteY
      );
      noteY += 5;
      doc.text(
        "  and 2 recent passport photos (with a white background).",
        25,
        noteY
      );
      noteY += 10;
      doc.text(
        "• Provision of any false information will lead to automatic cancellation and discontinuation",
        25,
        noteY
      );
      noteY += 5;
      doc.text("  once discovered.", 25, noteY);

      // Add applicant signature
      noteY += 15;
      doc.text(
        `Applicants Signature: _______________ Date (DD/MM/YY): __/____/___`,
        20,
        noteY
      );

      // Add page break
      doc.addPage();

      // Add header to new page
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Skills For Excellence", 105, 15, { align: "center" });

      // Add official use section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Official Use Only", 20, 30);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Admission Committee:", 20, 40);
      doc.text(
        "Officer's Name: ____________________________________________",
        20,
        50
      );
      doc.text(
        "Officer's Signature/ stamp: ___________________________ Date (DD/MM/YY): ____/____/_____",
        20,
        60
      );

      return doc;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsPdfGenerating(true);
      setError(null);
      setSuccessMessage(null);

      // Get application data for PDF generation
      const result = await generateApplicationPDF(params.id);

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to generate PDF");
      }

      // Generate PDF on the client side
      const doc = await generatePDF(result.data);

      // Save the PDF
      doc.save(`Application_${params.id}.pdf`);

      setSuccessMessage("PDF generated and downloaded successfully.");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      setError(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      setError(null);
      setSuccessMessage(null);

      // Get application data for printing
      const result = await printApplication(params.id);

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to process print request");
      }

      // Generate PDF on the client side
      const doc = await generatePDF(result.data);

      // Open and print the PDF
      doc.autoPrint();
      window.open(URL.createObjectURL(doc.output("blob")));

      setSuccessMessage("Print request sent successfully.");
    } catch (error: any) {
      console.error("Error printing application:", error);
      setError(
        error.message || "An unexpected error occurred. Please try again."
      );
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
              className="rounded-lg bg-blue-600 hover:bg-blue-700"
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
        <CardHeader className="pb-3 bg-blue-50/50 dark:bg-blue-950/20 border-b">
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
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className="grid grid-cols-4 md:w-[500px] rounded-lg">
              <TabsTrigger value="personal" className="rounded-md">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="education" className="rounded-md">
                Education
              </TabsTrigger>
              <TabsTrigger value="program" className="rounded-md">
                Program
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-md">
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Personal Information Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg">
                        Personal Information
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Full Name
                        </p>
                        <p className="font-medium">
                          {application.applicant.firstName}{" "}
                          {application.applicant.middleName}{" "}
                          {application.applicant.surname}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium capitalize">
                          {application.applicant.gender || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Date of Birth
                        </p>
                        <p className="font-medium">
                          {application.applicant.dateOfBirth
                            ? formatDate(application.applicant.dateOfBirth)
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Nationality
                        </p>
                        <p className="font-medium">
                          {application.applicant.nationality || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">
                          {application.applicant.email || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {application.applicant.phone || "Not specified"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">
                          Physical Address
                        </p>
                        <p className="font-medium">
                          {application.applicant.physicalAddress ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next of Kin Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg">Next of Kin</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {application.applicant.nextOfKinName ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Relationship
                        </p>
                        <p className="font-medium">
                          {application.applicant.nextOfKinRelationship ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Occupation
                        </p>
                        <p className="font-medium">
                          {application.applicant.nextOfKinOccupation ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {application.applicant.nextOfKinPhone ||
                            "Not specified"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {application.applicant.nextOfKinAddress ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sponsor Information Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg">
                        Sponsor Information
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {application.applicant.sponsorName || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Relationship
                        </p>
                        <p className="font-medium">
                          {application.applicant.sponsorRelationship ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Occupation
                        </p>
                        <p className="font-medium">
                          {application.applicant.sponsorOccupation ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {application.applicant.sponsorPhone ||
                            "Not specified"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {application.applicant.sponsorAddress ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Education History</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {application.applicant.educationHistory &&
                  application.applicant.educationHistory.length > 0 ? (
                    <div className="space-y-6">
                      {application.applicant.educationHistory.map(
                        (education: any, index: number) => (
                          <div
                            key={index}
                            className="border-b pb-4 last:border-0 last:pb-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Institution
                                </p>
                                <p className="font-medium">
                                  {education.institution}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Qualification
                                </p>
                                <p className="font-medium">
                                  {education.qualification}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Start Year
                                </p>
                                <p className="font-medium">
                                  {education.startYear}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  End Year
                                </p>
                                <p className="font-medium">
                                  {education.endYear || "Present"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No education history provided.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="program" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">
                      Program Information
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Program</p>
                      <p className="font-medium">{application.program.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">
                        {application.isShortCourse
                          ? "Short Course"
                          : application.program.type || "Regular Program"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {application.isShortCourse
                          ? application.shortCourseDuration
                          : application.program.duration || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tuition Fee
                      </p>
                      <p className="font-medium">
                        {application.program.tuitionFee
                          ? formatCurrency(application.program.tuitionFee)
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  {application.program.description && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Description
                      </p>
                      <p className="mt-1">{application.program.description}</p>
                    </div>
                  )}

                  {application.program.requirements && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Requirements
                      </p>
                      <p className="mt-1">{application.program.requirements}</p>
                    </div>
                  )}

                  {application.intake && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium">Intake Information</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Intake Name
                          </p>
                          <p className="font-medium">
                            {application.intake.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Application Fee
                          </p>
                          <p className="font-medium">
                            {application.intake.applicationFee
                              ? formatCurrency(
                                  application.intake.applicationFee
                                )
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Start Date
                          </p>
                          <p className="font-medium">
                            {formatDate(application.intake.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            End Date
                          </p>
                          <p className="font-medium">
                            {formatDate(application.intake.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {application.payment && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg">
                        Payment Information
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                          {application.payment.method || "Not specified"}
                        </p>
                      </div>
                      {application.payment.transactionId && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Transaction ID
                          </p>
                          <p className="font-medium">
                            {application.payment.transactionId}
                          </p>
                        </div>
                      )}
                      {application.payment.paidAt && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Payment Date
                          </p>
                          <p className="font-medium">
                            {formatDate(application.payment.paidAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">
                      Uploaded Documents
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {application.documents && application.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {application.documents.map((doc: any) => (
                        <div key={doc.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.type}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(doc.url, "_blank")}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Uploaded on {formatDate(doc.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No documents uploaded.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Clipboard className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">
                      Application Progress
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>{application.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${application.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
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
                </CardContent>
              </Card>
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
