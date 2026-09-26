import * as categoryRepository from "./category.repository.js";

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function toCategoryResponse(category, includeChildren = false) {
  const response = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };

  if (includeChildren) {
    response.parent = category.parent || null;
    response.children = category.children || [];
  }

  return response;
}

function createApplicationError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function listCategories({
  page = 1,
  pageSize = 20,
  parentId,
  includeChildren = false
}) {
  const skip = (page - 1) * pageSize;
  const [categories, total] = await Promise.all([
    categoryRepository.findCategories({
      skip,
      take: pageSize,
      parentId,
      includeChildren
    }),
    categoryRepository.countCategories(parentId)
  ]);

  return {
    data: categories.map((category) =>
      toCategoryResponse(category, includeChildren)
    ),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

export async function getCategoryById(id) {
  const category = await categoryRepository.findCategoryById(id);

  if (!category) {
    throw createApplicationError(404, "Category not found");
  }

  return toCategoryResponse(category, true);
}

export async function getCategoryBySlug(slug) {
  const category = await categoryRepository.findCategoryBySlug(slug);

  if (!category) {
    throw createApplicationError(404, "Category not found");
  }

  return toCategoryResponse(category, true);
}

export async function createCategory({
  name,
  slug,
  description = null,
  parentId = null
}) {
  if (parentId) {
    const parent = await categoryRepository.findCategoryById(parentId);

    if (!parent) {
      throw createApplicationError(400, "Parent category not found");
    }
  }

  const generatedSlug = slug || slugify(name);

  if (!generatedSlug) {
    throw createApplicationError(
      400,
      "Unable to generate a valid slug from name"
    );
  }

  return categoryRepository.createCategory({
    name,
    slug: generatedSlug,
    description,
    parent_id:parentId
  });
}

export async function updateCategory(id, data) {
  const existing = await categoryRepository.findCategoryById(id);

  if (!existing) {
    throw createApplicationError(404, "Category not found");
  }

  if (data.parentId !== undefined) {
    if (data.parentId === id) {
      throw createApplicationError(
        400,
        "A category cannot be its own parent"
      );
    }

    if (data.parentId !== null) {
      const parent = await categoryRepository.findCategoryById(data.parentId);

      if (!parent) {
        throw createApplicationError(400, "Parent category not found");
      }

      let ancestor = parent;

      while (ancestor?.parentId) {
        if (ancestor.parentId === id) {
          throw createApplicationError(
            400,
            "Category hierarchy cannot contain circular references"
          );
        }

        ancestor = await categoryRepository.findCategoryById(
          ancestor.parentId
        );
      }
    }
  }

  return categoryRepository.updateCategory(id, data);
}

export async function deleteCategory(id) {
  const existing = await categoryRepository.findCategoryById(id);

  if (!existing) {
    throw createApplicationError(404, "Category not found");
  }

  const [childCount, productCount] = await Promise.all([
    categoryRepository.countChildrenByParentId(id),
    categoryRepository.countProductsByCategoryId(id)
  ]);

  if (childCount > 0 || productCount > 0) {
    throw createApplicationError(
      409,
      "Category cannot be deleted while it has children or products"
    );
  }

  await categoryRepository.deleteCategory(id);
}