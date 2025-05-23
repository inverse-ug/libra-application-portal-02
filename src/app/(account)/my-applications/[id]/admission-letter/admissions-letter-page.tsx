"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getApplicationForAdmissionLetter } from "@/app/actions/admission-actions";
import { toast } from "sonner";

interface AdmissionLetterPageProps {
  applicationId: string;
}

export default function AdmissionLetterPage({
  applicationId,
}: AdmissionLetterPageProps) {
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const data = await getApplicationForAdmissionLetter(applicationId);
        if (!data) {
          toast.error("Application not found or access denied");
          return;
        }
        setApplication(data);
      } catch (error) {
        console.error("Error fetching application:", error);
        toast.error("Failed to load admission letter data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      // Create the admission letter content
      const admissionLetterContent = generateAdmissionLetterHTML(application);

      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(admissionLetterContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }

      toast.success("Admission letter is being prepared for download");
    } catch (error) {
      console.error("Error downloading admission letter:", error);
      toast.error("Failed to download admission letter");
    } finally {
      setIsDownloading(false);
    }
  };

  const generateAdmissionLetterHTML = (application: any) => {
    const applicantName =
      application.applicant.name ||
      `${application.applicant.firstName || ""} ${application.applicant.surname || ""}`.trim();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Letter - ${applicantName}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          
          .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin: 0;
          }
          
          .header h2 {
            color: #666;
            font-size: 18px;
            margin: 10px 0;
            font-weight: normal;
          }
          
          .admission-number {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
          }
          
          .admission-number strong {
            color: #2563eb;
            font-size: 18px;
          }
          
          .content {
            margin: 30px 0;
          }
          
          .content p {
            margin-bottom: 15px;
          }
          
          .program-details {
            background: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
          }
          
          .program-details h3 {
            color: #2563eb;
            margin-top: 0;
          }
          
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .details-table th, .details-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .details-table th {
            background: #f8fafc;
            font-weight: bold;
            color: #374151;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          
          .signature-box {
            text-align: center;
            min-width: 200px;
          }
          
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 5px;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PROVISIONAL ADMISSION LETTER</h1>
          <h2>Academic Year ${new Date().getFullYear()}/${new Date().getFullYear() + 1}</h2>
        </div>
        
        <div class="admission-number">
          <strong>Admission Number: ${application.admission?.admissionNumber || "PENDING"}</strong>
        </div>
        
        <div class="content">
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <p><strong>Dear ${applicantName},</strong></p>
          
          <p>We are pleased to inform you that you have been <strong>provisionally admitted</strong> to the following program:</p>
          
          <div class="program-details">
            <h3>Program Details</h3>
            <table class="details-table">
              <tr>
                <th>Program Title:</th>
                <td>${application.program?.title || "N/A"}</td>
              </tr>
              <tr>
                <th>Program Type:</th>
                <td>${application.program?.type?.replace("_", " ") || "N/A"}</td>
              </tr>
              <tr>
                <th>Duration:</th>
                <td>${application.program?.duration || "N/A"}</td>
              </tr>
              <tr>
                <th>Intake:</th>
                <td>${application.intake?.name || "N/A"}</td>
              </tr>
              <tr>
                <th>Start Date:</th>
                <td>${application.intake?.startDate ? new Date(application.intake.startDate).toLocaleDateString() : "TBD"}</td>
              </tr>
              ${
                application.program?.tuitionFee
                  ? `
              <tr>
                <th>Tuition Fee:</th>
                <td>UGX ${application.program.tuitionFee.toLocaleString()}</td>
              </tr>
              `
                  : ""
              }
            </table>
          </div>
          
          <p>This admission is provisional and subject to the following conditions:</p>
          
          <ol>
            <li>Verification of all submitted academic documents</li>
            <li>Payment of the required fees as per the fee structure</li>
            <li>Completion of the registration process</li>
            <li>Meeting any additional program-specific requirements</li>
          </ol>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Report to the admissions office with original documents for verification</li>
            <li>Complete the registration process</li>
            <li>Pay the required fees</li>
            <li>Attend the orientation program</li>
          </ul>
          
          <p>We look forward to welcoming you to our institution. Should you have any questions, please contact the admissions office.</p>
          
          <p>Congratulations on your admission!</p>
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">
              <strong>Admissions Officer</strong>
            </div>
          </div>
          
          <div class="signature-box">
            <div class="signature-line">
              <strong>Academic Registrar</strong>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><em>This is an official document. Please keep it safe for your records.</em></p>
          <p><small>Generated on: ${new Date().toLocaleString()}</small></p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">
              Admission Letter Not Found
            </h2>
            <p className="text-muted-foreground mb-4">
              The admission letter could not be found or you don't have access
              to it.
            </p>
            <Button asChild>
              <Link href="/application-history">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applicantName =
    application.applicant.name ||
    `${application.applicant.firstName || ""} ${application.applicant.surname || ""}`.trim();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Admission Letter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Applicant Information</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Name:</strong> {applicantName}
                  </p>
                  <p>
                    <strong>Email:</strong> {application.applicant.email}
                  </p>
                  {application.applicant.phone && (
                    <p>
                      <strong>Phone:</strong> {application.applicant.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Admission Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Admission Number:</strong>{" "}
                    {application.admission?.admissionNumber || "Pending"}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <Badge
                      variant="outline"
                      className="ml-2 bg-emerald-50 text-emerald-600 border-emerald-200">
                      {application.admission?.status || "PROVISIONAL"}
                    </Badge>
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Program Details */}
            <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">
                Program Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Program:</strong> {application.program?.title}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {application.program?.type?.replace("_", " ")}
                  </p>
                  {application.program?.duration && (
                    <p>
                      <strong>Duration:</strong> {application.program.duration}
                    </p>
                  )}
                </div>
                <div>
                  <p>
                    <strong>Intake:</strong> {application.intake?.name}
                  </p>
                  {application.intake?.startDate && (
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(
                        application.intake.startDate
                      ).toLocaleDateString()}
                    </p>
                  )}
                  {application.program?.tuitionFee && (
                    <p>
                      <strong>Tuition Fee:</strong> UGX{" "}
                      {application.program.tuitionFee.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Download Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Preparing Download..." : "Download PDF"}
              </Button>

              <Button variant="outline" asChild>
                <Link href="/application-history">View All Applications</Link>
              </Button>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-2">
                Important Notes:
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• This is a provisional admission letter</li>
                <li>
                  • Original documents must be verified during registration
                </li>
                <li>• Payment of fees is required to confirm admission</li>
                <li>• Please keep this letter safe for your records</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
