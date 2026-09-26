import prisma from "../../config/prisma.js";

export function findCategories({
  skip,
  take,
  parentId,
  includeChildren
}) {
  return prisma.categories.findMany({
    where: parentId === undefined ? undefined : { parent_id : parentId },
    skip,
    take,
    orderBy: {
      name: "asc"
    },
    include: includeChildren
      ? {
          parent: true,
          children: true
        }
      : undefined
  });
}

export function countCategories(parentId) {
  return prisma.categories.count({
    where: parentId === undefined ? undefined : { parent_id:parentId }
  });
}

export function findCategoryById(id) {
  return prisma.categories.findUnique({
    where: { id },
    include: {
      categories: true,
      other_categories: true
    }
  });
}

export function findCategoryBySlug(slug) {
  return prisma.categories.findUnique({
    where: { slug },
    include: {
      categories: true,
      other_categories: true
    }
  });
}

export function findCategoryByName(name) {
  return prisma.categories.findFirst({
    where: { name }
  });
}

export function createCategory(data) {
  return prisma.categories.create({
    data
  });
}

export function updateCategory(id, data) {
  return prisma.categories.update({
    where: { id },
    data
  });
}

export function deleteCategory(id) {
  return prisma.categories.delete({
    where: { id }
  });
}

export function countProductsByCategoryId(categoryId) {
  return prisma.products.count({
    where: { category_id :categoryId }
  });
}

export function countChildrenByParentId(parentId) {
  return prisma.categories.count({
    where: { parent_id:parentId }
  });
}