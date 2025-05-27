"use server";

import { prisma } from "@/lib/prisma";

/**
 * Get announcements from database
 */
export async function getAnnouncements(limit?: number) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isPublished: true,
      },
      include: {
        intake: {
          include: {
            programs: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    return announcements;
  } catch (error) {
    console.error("Error fetching announcements:", error);
  }
}
