"use server";

import prisma from "../../../lib/prisma";
import { ProgramType } from "../generated/prisma";

export async function seedDatabase() {
  try {
    // Create categories
    const diplomaCategory = await prisma.category.upsert({
      where: { id: "cat_diploma" },
      update: {},
      create: {
        id: "cat_diploma",
        name: "Diploma",
        description: "Diploma level courses",
      },
    });

    const certificateCategory = await prisma.category.upsert({
      where: { id: "cat_certificate" },
      update: {},
      create: {
        id: "cat_certificate",
        name: "Certificate",
        description: "Certificate level courses",
      },
    });

    const shortCourseCategory = await prisma.category.upsert({
      where: { id: "cat_short" },
      update: {},
      create: {
        id: "cat_short",
        name: "Short Course",
        description: "Short courses (3-6 months)",
      },
    });

    // Create intakes
    const januaryIntake = await prisma.intake.upsert({
      where: { id: "january-2023" },
      update: {},
      create: {
        id: "january-2023",
        name: "January 2023 Intake",
        description: "January 2023 intake for all programs",
        applicationFee: 50000,
        startDate: new Date("2023-01-15"),
        endDate: new Date("2023-01-31"),
        isActive: false,
      },
    });

    const mayIntake = await prisma.intake.upsert({
      where: { id: "may-2023" },
      update: {},
      create: {
        id: "may-2023",
        name: "May 2023 Intake",
        description: "May 2023 intake for all programs",
        applicationFee: 50000,
        startDate: new Date("2023-05-15"),
        endDate: new Date("2023-05-31"),
        isActive: false,
      },
    });

    const septemberIntake = await prisma.intake.upsert({
      where: { id: "september-2023" },
      update: {},
      create: {
        id: "september-2023",
        name: "September 2023 Intake",
        description: "September 2023 intake for all programs",
        applicationFee: 50000,
        startDate: new Date("2023-09-15"),
        endDate: new Date("2023-09-30"),
        isActive: false,
      },
    });

    const currentIntake = await prisma.intake.upsert({
      where: { id: "may-2024" },
      update: {},
      create: {
        id: "may-2024",
        name: "May 2024 Intake",
        description: "Current intake for all programs",
        applicationFee: 50000,
        startDate: new Date("2024-05-01"),
        endDate: new Date("2024-05-31"),
        isActive: true,
      },
    });

    // Create programs
    const programs = [
      {
        id: "prog_it_diploma",
        title: "Information Technology",
        description:
          "Comprehensive program covering computer systems, networks, and software development",
        type: ProgramType.DIPLOMA,
        duration: "2 years",
        tuitionFee: 1500000,
        requirements: "UCE with at least 5 passes",
        categories: {
          connect: [
            { id: diplomaCategory.id },
            { id: certificateCategory.id },
            { id: shortCourseCategory.id },
          ],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: true,
      },
      {
        id: "prog_beauty_diploma",
        title: "Cosmetology and Beauty Therapy",
        description:
          "Learn professional beauty techniques and salon management",
        type: ProgramType.DIPLOMA,
        duration: "2 years",
        tuitionFee: 1200000,
        requirements: "UCE with at least 5 passes",
        categories: {
          connect: [
            { id: diplomaCategory.id },
            { id: certificateCategory.id },
            { id: shortCourseCategory.id },
          ],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: true,
      },
      {
        id: "prog_fashion_diploma",
        title: "Fashion and Garment Design",
        description:
          "Master the art of clothing design, pattern making, and fashion business",
        type: ProgramType.DIPLOMA,
        duration: "2 years",
        tuitionFee: 1300000,
        requirements: "UCE with at least 5 passes",
        categories: {
          connect: [
            { id: diplomaCategory.id },
            { id: certificateCategory.id },
            { id: shortCourseCategory.id },
          ],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: true,
      },
      {
        id: "prog_electrical_diploma",
        title: "Electrical Engineering",
        description:
          "Study electrical systems, power distribution, and electronics",
        type: ProgramType.DIPLOMA,
        duration: "2 years",
        tuitionFee: 1600000,
        requirements: "UCE with passes in Mathematics and Physics",
        categories: {
          connect: [{ id: diplomaCategory.id }],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: false,
      },
      {
        id: "prog_electrical_cert",
        title: "Electrical Installation Systems and Maintenance",
        description:
          "Practical training in electrical installation and maintenance",
        type: ProgramType.CERTIFICATE,
        duration: "1 year",
        tuitionFee: 900000,
        requirements: "UCE with passes in Mathematics",
        categories: {
          connect: [
            { id: certificateCategory.id },
            { id: shortCourseCategory.id },
          ],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: true,
      },
      {
        id: "prog_water_diploma",
        title: "Water Engineering",
        description:
          "Study water resources, treatment systems, and distribution networks",
        type: ProgramType.DIPLOMA,
        duration: "2 years",
        tuitionFee: 1500000,
        requirements: "UCE with passes in Mathematics and Chemistry",
        categories: {
          connect: [{ id: diplomaCategory.id }],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: false,
      },
      {
        id: "prog_plumbing_cert",
        title: "Plumbing",
        description:
          "Learn installation and maintenance of water systems and fixtures",
        type: ProgramType.CERTIFICATE,
        duration: "1 year",
        tuitionFee: 800000,
        requirements: "UCE with at least 3 passes",
        categories: {
          connect: [
            { id: certificateCategory.id },
            { id: shortCourseCategory.id },
          ],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: true,
      },
      {
        id: "prog_building_diploma",
        title: "Building and Civil Engineering",
        description:
          "Study structural design, construction methods, and project management",
        type: ProgramType.DIPLOMA,
        duration: "2 years",
        tuitionFee: 1600000,
        requirements: "UCE with passes in Mathematics and Physics",
        categories: {
          connect: [{ id: diplomaCategory.id }],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: false,
      },
      {
        id: "prog_building_cert",
        title: "Building Construction",
        description:
          "Practical training in construction techniques and site management",
        type: ProgramType.CERTIFICATE,
        duration: "1 year",
        tuitionFee: 900000,
        requirements: "UCE with at least 3 passes",
        categories: {
          connect: [
            { id: certificateCategory.id },
            { id: shortCourseCategory.id },
          ],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: true,
      },
      {
        id: "prog_catering_diploma",
        title: "Institutional Catering and Hotel Management",
        description:
          "Learn culinary arts, food service, and hospitality management",
        type: ProgramType.DIPLOMA,
        duration: "2 years",
        tuitionFee: 1400000,
        requirements: "UCE with at least 5 passes",
        categories: {
          connect: [
            { id: diplomaCategory.id },
            { id: certificateCategory.id },
            { id: shortCourseCategory.id },
          ],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: true,
      },
      {
        id: "prog_mechanical_diploma",
        title: "Mechanical Engineering",
        description:
          "Study machine design, manufacturing processes, and mechanical systems",
        type: ProgramType.DIPLOMA,
        duration: "2 years",
        tuitionFee: 1600000,
        requirements: "UCE with passes in Mathematics and Physics",
        categories: {
          connect: [{ id: diplomaCategory.id }],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: false,
      },
      {
        id: "prog_automotive_cert",
        title: "Automotive Mechanics",
        description:
          "Learn vehicle repair, maintenance, and diagnostic techniques",
        type: ProgramType.CERTIFICATE,
        duration: "1 year",
        tuitionFee: 950000,
        requirements: "UCE with at least 3 passes",
        categories: {
          connect: [
            { id: certificateCategory.id },
            { id: shortCourseCategory.id },
          ],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: true,
      },
      {
        id: "prog_nursing_diploma",
        title: "Home Based Care Nursing",
        description:
          "Learn patient care, medical procedures, and healthcare management",
        type: ProgramType.DIPLOMA,
        duration: "2 years",
        tuitionFee: 1500000,
        requirements: "UCE with passes in Biology and Chemistry",
        categories: {
          connect: [
            { id: diplomaCategory.id },
            { id: certificateCategory.id },
            { id: shortCourseCategory.id },
          ],
        },
        intakes: {
          connect: [
            { id: januaryIntake.id },
            { id: mayIntake.id },
            { id: septemberIntake.id },
            { id: currentIntake.id },
          ],
        },
        isShortCourse: true,
      },
    ];

    // Create all programs
    for (const program of programs) {
      await prisma.program.upsert({
        where: { id: program.id },
        update: program,
        create: program,
      });
    }

    // Create announcements
    await prisma.announcement.upsert({
      where: { id: "announcement-1" },
      update: {},
      create: {
        id: "announcement-1",
        title: "May 2024 Intake Now Open",
        content:
          "Applications for the May 2024 intake are now open. Apply before May 31st to secure your spot.",
        intakeId: currentIntake.id,
        isPublished: true,
      },
    });

    await prisma.announcement.upsert({
      where: { id: "announcement-2" },
      update: {},
      create: {
        id: "announcement-2",
        title: "New Short Courses Available",
        content:
          "We've added new short courses in IT, Beauty Therapy, and Automotive Mechanics. Courses start monthly.",
        isPublished: true,
      },
    });

    await prisma.announcement.upsert({
      where: { id: "announcement-3" },
      update: {},
      create: {
        id: "announcement-3",
        title: "Scholarship Opportunities",
        content:
          "Limited scholarships available for outstanding students. Contact the admissions office for details.",
        isPublished: true,
      },
    });

    return { success: true, message: "Database seeded successfully" };
  } catch (error) {
    console.error("Error seeding database:", error);
    return {
      success: false,
      message: "Error seeding database",
      error: String(error),
    };
  }
}
