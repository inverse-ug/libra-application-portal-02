"use server";

import { auth } from "../../../auth";
import prisma from "../../../lib/prisma";

/**
 * Get all intakes with optional filtering
 */
export async function getIntakes({
  limit,
  isActive,
}: { limit?: number; isActive?: boolean } = {}) {
  const query: any = {};

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  let intakes = await prisma.intake.findMany({
    where: query,
    include: {
      programs: true,
      applications: {
        include: {
          payment: true,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  // Apply limit if specified
  if (limit) {
    intakes = intakes.slice(0, limit);
  }

  return intakes;
}

/**
 * Get a single intake by ID
 */
export async function getIntakeById(id: string) {
  const intake = await prisma.intake.findUnique({
    where: { id },
    include: {
      programs: {
        include: {
          categories: true,
        },
      },
      applications: {
        include: {
          payment: true,
        },
      },
    },
  });

  return intake;
}

/**
 * Get user applications for intakes
 */
export async function getUserApplications(userId?: string) {
  if (!userId) {
    const session = await auth();
    userId = session?.user.id;
  }

  if (!userId) return [];

  const applications = await prisma.application.findMany({
    where: {
      applicantId: userId,
    },
    include: {
      intake: true,
      program: true,
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return applications;
}

/**
 * Get announcements
 */
export async function getAnnouncements(limit?: number) {
  // This is a placeholder - you would need to create an Announcement model in your Prisma schema
  // For now, we'll return mock data
  const announcements = [
    {
      id: "1",
      title: "Applications Open for January 2025",
      content:
        "Applications for the January 2025 intake are now open. Apply early to secure your spot.",
      createdAt: new Date("2024-10-01"),
    },
    {
      id: "2",
      title: "New Programs Added",
      content:
        "We've added several new programs to our offerings. Check them out in the programs section.",
      createdAt: new Date("2024-09-15"),
    },
    {
      id: "3",
      title: "Scholarship Opportunities",
      content:
        "New scholarship opportunities are available for qualified applicants. See the scholarships page for details.",
      createdAt: new Date("2024-09-01"),
    },
  ];

  return limit ? announcements.slice(0, limit) : announcements;
}
