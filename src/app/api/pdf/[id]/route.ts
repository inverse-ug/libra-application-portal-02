import { type NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const applicationId = params.id;

    // Get application with all related data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        applicant: {
          include: {
            educationHistory: true,
          },
        },
        program: true,
        intake: true,
        documents: true,
      },
    });

    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    if (application.applicant.email !== session.user.email) {
      return new NextResponse(
        "Unauthorized - You don't have permission to access this application",
        { status: 401 }
      );
    }

    // Create a new PDF document
    const doc = new jsPDF();

    // Add logo
    // In a real implementation, you would add the logo image
    // doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30)

    // Add header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("LIBRA VOCATIONAL AND BUSINESS INSTITUTE", 105, 20, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("P.O. Box 12345, Kampala, Uganda", 105, 28, { align: "center" });
    doc.text("Tel: +256 700 123456 | Email: info@libra.edu", 105, 34, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("APPLICATION FORM", 105, 45, { align: "center" });

    // Add application reference number
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Application ID: ${application.id.substring(0, 8)}`, 15, 55);
    doc.text(
      `Date: ${new Date(application.createdAt).toLocaleDateString()}`,
      15,
      60
    );

    // Personal Information Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("1. PERSONAL INFORMATION", 15, 70);
    doc.line(15, 72, 195, 72);

    const applicant = application.applicant;

    autoTable(doc, {
      startY: 75,
      head: [],
      body: [
        [
          "Full Name",
          `${applicant.firstName || ""} ${applicant.middleName || ""} ${applicant.surname || ""}`,
        ],
        [
          "Date of Birth",
          applicant.dateOfBirth
            ? new Date(applicant.dateOfBirth).toLocaleDateString()
            : "N/A",
        ],
        ["Gender", applicant.gender || "N/A"],
        ["Nationality", applicant.nationality || "N/A"],
        ["Physical Address", applicant.physicalAddress || "N/A"],
        ["Phone Number", applicant.phone || "N/A"],
        ["Email Address", applicant.email || "N/A"],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
    });

    // Program Information Section
    const currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("2. PROGRAM INFORMATION", 15, currentY);
    doc.line(15, currentY + 2, 195, currentY + 2);

    autoTable(doc, {
      startY: currentY + 5,
      head: [],
      body: [
        ["Program", application.program.title],
        [
          "Program Type",
          application.isShortCourse
            ? `Short Course (${application.shortCourseDuration})`
            : application.program.type,
        ],
        ["Duration", application.program.duration || "N/A"],
        ["Intake", application.intake ? application.intake.name : "N/A"],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
    });

    // Education History Section
    const currentY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("3. EDUCATION HISTORY", 15, currentY2);
    doc.line(15, currentY2 + 2, 195, currentY2 + 2);

    if (applicant.educationHistory && applicant.educationHistory.length > 0) {
      const educationData = applicant.educationHistory.map((edu: any) => [
        edu.institutionName,
        edu.qualification,
        `${edu.startYear} - ${edu.endYear || "Present"}`,
      ]);

      autoTable(doc, {
        startY: currentY2 + 5,
        head: [["Institution", "Qualification", "Period"]],
        body: educationData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3 },
      });
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("No education history provided", 15, currentY2 + 10);
    }

    // Sponsor Information Section
    const currentY3 = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY + 10
      : currentY2 + 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("4. SPONSOR INFORMATION", 15, currentY3);
    doc.line(15, currentY3 + 2, 195, currentY3 + 2);

    autoTable(doc, {
      startY: currentY3 + 5,
      head: [],
      body: [
        ["Sponsor Name", applicant.sponsorName || "N/A"],
        ["Relationship", applicant.sponsorRelationship || "N/A"],
        ["Occupation", applicant.sponsorOccupation || "N/A"],
        ["Phone Number", applicant.sponsorPhone || "N/A"],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
    });

    // Next of Kin Information Section
    const currentY4 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("5. NEXT OF KIN INFORMATION", 15, currentY4);
    doc.line(15, currentY4 + 2, 195, currentY4 + 2);

    autoTable(doc, {
      startY: currentY4 + 5,
      head: [],
      body: [
        ["Name", applicant.nextOfKinName || "N/A"],
        ["Relationship", applicant.nextOfKinRelationship || "N/A"],
        ["Occupation", applicant.nextOfKinOccupation || "N/A"],
        ["Phone Number", applicant.nextOfKinPhone || "N/A"],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
    });

    // Declaration Section
    const currentY5 = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("6. DECLARATION", 15, currentY5);
    doc.line(15, currentY5 + 2, 195, currentY5 + 2);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "I declare that the information provided in this application is true and correct to the best of my knowledge. " +
        "I understand that any false or misleading information may result in the cancellation of my application or enrollment.",
      15,
      currentY5 + 10,
      { maxWidth: 180 }
    );

    // Signature fields
    doc.text("Applicant's Signature: ____________________", 15, currentY5 + 25);
    doc.text("Date: ____________________", 130, currentY5 + 25);

    // For Official Use Section
    if (currentY5 + 40 > 270) {
      doc.addPage();
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("FOR OFFICIAL USE ONLY", 15, 20);
      doc.line(15, 22, 195, 22);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Application Status: " + application.status, 15, 30);
      doc.text("Reviewed By: ____________________", 15, 40);
      doc.text("Date: ____________________", 15, 50);
      doc.text(
        "Comments: ____________________________________________________________",
        15,
        60
      );
      doc.text(
        "__________________________________________________________________________",
        15,
        70
      );
    } else {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("FOR OFFICIAL USE ONLY", 15, currentY5 + 40);
      doc.line(15, currentY5 + 42, 195, currentY5 + 42);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Application Status: " + application.status, 15, currentY5 + 50);
      doc.text("Reviewed By: ____________________", 15, currentY5 + 60);
      doc.text("Date: ____________________", 15, currentY5 + 70);
      doc.text(
        "Comments: ____________________________________________________________",
        15,
        currentY5 + 80
      );
      doc.text(
        "__________________________________________________________________________",
        15,
        currentY5 + 90
      );
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Libra Vocational and Business Institute - Application Form",
        105,
        285,
        { align: "center" }
      );
      doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: "right" });
    }

    // Convert the PDF to a blob
    const pdfBlob = doc.output("blob");

    // Create a response with the PDF
    return new NextResponse(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="application-${applicationId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Error generating PDF", { status: 500 });
  }
}
