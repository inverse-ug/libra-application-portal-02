"use server";

import { prisma } from "@/lib/prisma";

export async function seedDatabase() {
  try {
    // 1. First, clear all existing data
    await prisma.$transaction([
      prisma.document.deleteMany(),
      prisma.payment.deleteMany(),
      prisma.admission.deleteMany(),
      prisma.application.deleteMany(),
      prisma.program.deleteMany(),
      prisma.intake.deleteMany(),
      prisma.category.deleteMany(),
      prisma.announcement.deleteMany(),
    ]);

    // 2. Create categories with correct codes
    const categories = [
      {
        id: "cat_dit",
        code: "DIT",
        name: "DIRECTORATE OF INDUSTRIAL TRAINING",
        description: "Directorate level industrial training programs",
      },
      {
        id: "cat_jc",
        code: "JC",
        name: "JUNIOR CERTIFICATE",
        description: "Junior certificate level programs",
      },
      {
        id: "cat_lc",
        code: "LC",
        name: "LIBRA CERTIFICATE",
        description: "Libra certificate level programs",
      },
      {
        id: "cat_nc",
        code: "NC",
        name: "NATIONAL CERTIFICATE",
        description: "National certificate level programs",
      },
    ];

    for (const category of categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          code: category.code,
          name: category.name,
          description: category.description,
        },
      });
    }

    // 3. Create current intake
    const currentIntake = await prisma.intake.create({
      data: {
        id: "may-2025",
        name: "May 2025 Intake",
        description: "Current intake for all programs",
        applicationFee: 50000,
        startDate: new Date("2025-05-01"),
        endDate: new Date("2025-05-31"),
        isActive: true,
      },
    });

    // 4. Create ALL 35 programs with exact names and codes
    const programs = [
      // DIT Programs (9)
      {
        id: "dit_dihc",
        title:
          "DIRECTORATE OF INDUSTRIAL TRAINING IN CATERING AND HOTEL MANAGEMENT",
        code: "DIHC",
        description: "Professional catering and hotel management training",
        duration: "2 years",
        tuitionFee: 1400000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_dit",
        isShortCourse: false,
      },
      {
        id: "dit_dicm",
        title:
          "DIRECTORATE OF INDUSTRIAL TRAINING IN COMPUTER REPAIR AND MAINTENANCE",
        code: "DICM",
        description: "Computer hardware and software maintenance",
        duration: "2 years",
        tuitionFee: 1500000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_dit",
        isShortCourse: false,
      },
      {
        id: "dit_dicb",
        title:
          "DIRECTORATE OF INDUSTRIAL TRAINING IN COSMETOLOGY AND BODY THERAPY",
        code: "DICB",
        description: "Professional beauty therapy training",
        duration: "2 years",
        tuitionFee: 1200000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_dit",
        isShortCourse: false,
      },
      {
        id: "dit_diei",
        title:
          "DIRECTORATE OF INDUSTRIAL TRAINING IN ELECTRICAL INSTALLATION AND MAINTENANCE",
        code: "DIEI",
        description: "Electrical systems installation and maintenance",
        duration: "2 years",
        tuitionFee: 1600000,
        requirements: "UCE with Math and Physics",
        categoryId: "cat_dit",
        isShortCourse: false,
      },
      {
        id: "dit_difd",
        title:
          "DIRECTORATE OF INDUSTRIAL TRAINING IN FASHION AND GARMENT DESIGN",
        code: "DIFD",
        description: "Professional fashion design training",
        duration: "2 years",
        tuitionFee: 1300000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_dit",
        isShortCourse: false,
      },
      {
        id: "dit_dihn",
        title: "DIRECTORATE OF INDUSTRIAL TRAINING IN HOME CARE NURSING",
        code: "DIHN",
        description: "Professional home nursing care training",
        duration: "2 years",
        tuitionFee: 1500000,
        requirements: "UCE with Biology and Chemistry",
        categoryId: "cat_dit",
        isShortCourse: false,
      },
      {
        id: "dit_diit",
        title: "DIRECTORATE OF INDUSTRIAL TRAINING IN INFORMATION TECHNOLOGY",
        code: "DIIT",
        description: "Comprehensive IT systems training",
        duration: "2 years",
        tuitionFee: 1500000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_dit",
        isShortCourse: false,
      },
      {
        id: "dit_diam",
        title: "DIRECTORATE OF INDUSTRIAL TRAINING IN AUTOMOTIVE MECHANICS",
        code: "DIAM",
        description: "Professional automotive repair training",
        duration: "2 years",
        tuitionFee: 1600000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_dit",
        isShortCourse: false,
      },
      {
        id: "dit_dipl",
        title: "DIRECTORATE OF INDUSTRIAL TRAINING IN PLUMBING",
        code: "DIPL",
        description: "Professional plumbing systems training",
        duration: "2 years",
        tuitionFee: 1400000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_dit",
        isShortCourse: false,
      },

      // JC Programs (8)
      {
        id: "jc_jchc",
        title: "JUNIOR CERTIFICATE IN CATERING AND HOTEL MANAGEMENT",
        code: "JCHC",
        description: "Basic catering and hotel operations",
        duration: "1 year",
        tuitionFee: 800000,
        requirements: "PLE with at least 4 passes",
        categoryId: "cat_jc",
        isShortCourse: true,
      },
      {
        id: "jc_jccr",
        title: "JUNIOR CERTIFICATE IN COMPUTER REPAIR AND MAINTENANCE",
        code: "JCCR",
        description: "Basic computer maintenance",
        duration: "1 year",
        tuitionFee: 900000,
        requirements: "PLE with at least 4 passes",
        categoryId: "cat_jc",
        isShortCourse: true,
      },
      {
        id: "jc_jccb",
        title: "JUNIOR CERTIFICATE IN COSMETOLOGY AND BEAUTY THERAPY",
        code: "JCCB",
        description: "Basic beauty therapy training",
        duration: "1 year",
        tuitionFee: 850000,
        requirements: "PLE with at least 4 passes",
        categoryId: "cat_jc",
        isShortCourse: true,
      },
      {
        id: "jc_jcei",
        title: "JUNIOR CERTIFICATE IN ELECTRICAL INSTALLATION AND MAINTENANCE",
        code: "JCEI",
        description: "Basic electrical systems training",
        duration: "1 year",
        tuitionFee: 950000,
        requirements: "PLE with at least 4 passes",
        categoryId: "cat_jc",
        isShortCourse: true,
      },
      {
        id: "jc_jcfd",
        title: "JUNIOR CERTIFICATE IN FASHION AND GARMENT DESIGN",
        code: "JCFD",
        description: "Basic fashion design training",
        duration: "1 year",
        tuitionFee: 850000,
        requirements: "PLE with at least 4 passes",
        categoryId: "cat_jc",
        isShortCourse: true,
      },
      {
        id: "jc_jcam",
        title: "JUNIOR CERTIFICATE IN AUTOMOTIVE MECHANICS",
        code: "JCAM",
        description: "Basic automotive repair training",
        duration: "1 year",
        tuitionFee: 950000,
        requirements: "PLE with at least 4 passes",
        categoryId: "cat_jc",
        isShortCourse: true,
      },
      {
        id: "jc_jcpl",
        title: "JUNIOR CERTIFICATE IN PLUMBING",
        code: "JCPL",
        description: "Basic plumbing systems training",
        duration: "1 year",
        tuitionFee: 900000,
        requirements: "PLE with at least 4 passes",
        categoryId: "cat_jc",
        isShortCourse: true,
      },
      {
        id: "jc_jcwf",
        title: "JUNIOR CERTIFICATE IN WELDING AND FABRICATION",
        code: "JCWF",
        description: "Basic welding and metal fabrication",
        duration: "1 year",
        tuitionFee: 950000,
        requirements: "PLE with at least 4 passes",
        categoryId: "cat_jc",
        isShortCourse: true,
      },

      // LC Programs (9)
      {
        id: "lc_lchc",
        title: "LIBRA CERTIFICATE IN CATERING AND HOTEL MANAGEMENT",
        code: "LCHC",
        description: "Intermediate catering and hotel operations",
        duration: "1 year",
        tuitionFee: 950000,
        requirements: "UCE with at least 4 passes",
        categoryId: "cat_lc",
        isShortCourse: true,
      },
      {
        id: "lc_lccr",
        title: "LIBRA CERTIFICATE IN COMPUTER REPAIR AND MAINTENANCE",
        code: "LCCR",
        description: "Intermediate computer maintenance",
        duration: "1 year",
        tuitionFee: 1000000,
        requirements: "UCE with at least 4 passes",
        categoryId: "cat_lc",
        isShortCourse: true,
      },
      {
        id: "lc_lccb",
        title: "LIBRA CERTIFICATE IN COSMETOLOGY AND BODY THERAPY",
        code: "LCCB",
        description: "Intermediate beauty therapy training",
        duration: "1 year",
        tuitionFee: 950000,
        requirements: "UCE with at least 4 passes",
        categoryId: "cat_lc",
        isShortCourse: true,
      },
      {
        id: "lc_lcei",
        title: "LIBRA CERTIFICATE IN ELECTRICAL INSTALLATION AND MAINTENANCE",
        code: "LCEI",
        description: "Intermediate electrical systems training",
        duration: "1 year",
        tuitionFee: 1050000,
        requirements: "UCE with at least 4 passes",
        categoryId: "cat_lc",
        isShortCourse: true,
      },
      {
        id: "lc_lcfd",
        title: "LIBRA CERTIFICATE IN FASHION AND DESIGN",
        code: "LCFD",
        description: "Intermediate fashion design training",
        duration: "1 year",
        tuitionFee: 950000,
        requirements: "UCE with at least 4 passes",
        categoryId: "cat_lc",
        isShortCourse: true,
      },
      {
        id: "lc_lcit",
        title: "LIBRA CERTIFICATE IN INFORMATION TECHNOLOGY",
        code: "LCIT",
        description: "Intermediate IT systems training",
        duration: "1 year",
        tuitionFee: 1000000,
        requirements: "UCE with at least 4 passes",
        categoryId: "cat_lc",
        isShortCourse: true,
      },
      {
        id: "lc_lcam",
        title: "LIBRA CERTIFICATE IN AUTOMOTIVE MECHANICS",
        code: "LCAM",
        description: "Intermediate automotive repair training",
        duration: "1 year",
        tuitionFee: 1050000,
        requirements: "UCE with at least 4 passes",
        categoryId: "cat_lc",
        isShortCourse: true,
      },
      {
        id: "lc_lcpl",
        title: "LIBRA CERTIFICATE IN PLUMBING",
        code: "LCPL",
        description: "Intermediate plumbing systems training",
        duration: "1 year",
        tuitionFee: 1000000,
        requirements: "UCE with at least 4 passes",
        categoryId: "cat_lc",
        isShortCourse: true,
      },
      {
        id: "lc_lcwf",
        title: "LIBRA CERTIFICATE IN WELDING AND FABRICATION",
        code: "LCWF",
        description: "Intermediate welding and metal fabrication",
        duration: "1 year",
        tuitionFee: 1050000,
        requirements: "UCE with at least 4 passes",
        categoryId: "cat_lc",
        isShortCourse: true,
      },

      // NC Programs (9)
      {
        id: "nc_nccm",
        title: "NATIONAL CERTIFICATE IN COMPUTER REPAIR AND MAINTENANCE",
        code: "NCCM",
        description: "Advanced computer maintenance training",
        duration: "1 year",
        tuitionFee: 1100000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_nc",
        isShortCourse: false,
      },
      {
        id: "nc_ncam",
        title: "NATIONAL CERTIFICATE IN AUTOMOTIVE MECHANICS",
        code: "NCAM",
        description: "Advanced automotive repair training",
        duration: "1 year",
        tuitionFee: 1150000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_nc",
        isShortCourse: false,
      },
      {
        id: "nc_nccb",
        title: "NATIONAL CERTIFICATE IN COSMETOLOGY AND BODY THERAPY",
        code: "NCCB",
        description: "Advanced beauty therapy training",
        duration: "1 year",
        tuitionFee: 1050000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_nc",
        isShortCourse: false,
      },
      {
        id: "nc_nces",
        title:
          "NATIONAL CERTIFICATE IN ELECTRICAL INSTALLATION SYSTEMS AND MAINTENANCE",
        code: "NCES",
        description: "Advanced electrical systems training",
        duration: "1 year",
        tuitionFee: 1200000,
        requirements: "UCE with Math and Physics",
        categoryId: "cat_nc",
        isShortCourse: false,
      },
      {
        id: "nc_ncfd",
        title: "NATIONAL CERTIFICATE IN FASHION AND GARMENT DESIGN",
        code: "NCFD",
        description: "Advanced fashion design training",
        duration: "1 year",
        tuitionFee: 1100000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_nc",
        isShortCourse: false,
      },
      {
        id: "nc_nchc",
        title: "NATIONAL CERTIFICATE IN HOTEL AND INSTITUTIONAL CATERING",
        code: "NCHC",
        description: "Advanced catering and hotel management",
        duration: "1 year",
        tuitionFee: 1150000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_nc",
        isShortCourse: false,
      },
      {
        id: "nc_ncit",
        title:
          "NATIONAL CERTIFICATE IN INFORMATION AND COMMUNICATION TECHNOLOGY",
        code: "NCIT",
        description: "Advanced ICT systems training",
        duration: "1 year",
        tuitionFee: 1200000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_nc",
        isShortCourse: false,
      },
      {
        id: "nc_ncpl",
        title: "NATIONAL CERTIFICATE IN PLUMBING",
        code: "NCPL",
        description: "Advanced plumbing systems training",
        duration: "1 year",
        tuitionFee: 1150000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_nc",
        isShortCourse: false,
      },
      {
        id: "nc_ncwf",
        title: "NATIONAL CERTIFICATE IN WELDING AND FABRICATION",
        code: "NCWF",
        description: "Advanced welding and metal fabrication",
        duration: "1 year",
        tuitionFee: 1200000,
        requirements: "UCE with at least 5 passes",
        categoryId: "cat_nc",
        isShortCourse: false,
      },
    ];

    // Create all programs
    for (const program of programs) {
      await prisma.program.create({
        data: {
          id: program.id,
          title: program.title,
          code: program.code,
          description: program.description,
          duration: program.duration,
          tuitionFee: program.tuitionFee,
          requirements: program.requirements,
          isShortCourse: program.isShortCourse,
          categories: {
            connect: { id: program.categoryId },
          },
          intakes: {
            connect: { id: currentIntake.id },
          },
        },
      });
    }

    // 5. Create sample announcements
    await prisma.announcement.createMany({
      data: [
        {
          title: "May 2025 Intake Now Open",
          content:
            "Applications for all DIT, JC, LC and NC programs are now open",
          intakeId: currentIntake.id,
          isPublished: true,
        },
        {
          title: "New Programs Available",
          content: "All 35 programs now available for enrollment",
          isPublished: true,
        },
      ],
    });

    return {
      success: true,
      message: "Database seeded successfully with all 35 programs",
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    return {
      success: false,
      message: "Error seeding database",
      error: String(error),
    };
  }
}
