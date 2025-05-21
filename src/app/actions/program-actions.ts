"use server";

import prisma from "../../../lib/prisma";

/**
 * Get all programs with optional filtering
 */
export async function getPrograms({
  categoryId,
}: { categoryId?: string } = {}) {
  const query: any = {};

  if (categoryId) {
    query.categories = {
      some: {
        id: categoryId,
      },
    };
  }

  const programs = await prisma.program.findMany({
    where: query,
    include: {
      categories: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  return programs;
}

/**
 * Get a single program by ID
 */
export async function getProgramById(id: string) {
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      categories: true,
      intakes: {
        where: {
          isActive: true,
        },
        orderBy: {
          startDate: "asc",
        },
      },
    },
  });

  return program;
}

/**
 * Get all categories
 */
export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return categories;
}
