"use server";
import prisma from "../../../lib/prisma";

/**
 * Get all programs
 */
export async function getPrograms(options?: { intakeId?: string }) {
  const where: any = {
    isShortCourse: false,
  };

  // If intakeId is provided, filter programs by intake
  if (options?.intakeId) {
    where.intakes = {
      some: {
        id: options.intakeId,
      },
    };
  }

  const programs = await prisma.program.findMany({
    where,
    include: {
      categories: true,
      intakes: {
        where: {
          endDate: {
            gte: new Date(),
          },
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  return programs;
}

/**
 * Get all short courses
 */
export async function getShortCourses() {
  const shortCourses = await prisma.program.findMany({
    where: {
      isShortCourse: true,
    },
    include: {
      categories: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  return shortCourses;
}

/**
 * Get all intakes
 */
export async function getIntakes(options?: {
  limit?: number;
  isActive?: boolean;
}) {
  const where: any = {};

  if (options?.isActive) {
    where.isActive = true;
    where.endDate = {
      gte: new Date(),
    };
  }

  const intakes = await prisma.intake.findMany({
    where,
    take: options?.limit,
    orderBy: {
      startDate: "asc",
    },
  });

  return intakes;
}

/**
 * Get program by ID
 */
export async function getProgramById(id: string) {
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      categories: true,
      intakes: {
        where: {
          isActive: true,
          endDate: {
            gte: new Date(),
          },
        },
      },
    },
  });

  return program;
}

/**
 * Get programs by category
 */
export async function getProgramsByCategory(categoryId: string) {
  const programs = await prisma.program.findMany({
    where: {
      categories: {
        some: {
          id: categoryId,
        },
      },
    },
    include: {
      categories: true,
      intakes: {
        where: {
          isActive: true,
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  return programs;
}
