import { Router } from "express";

import {
  listCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from "./category.controller.js";

import {
  listCategoriesValidation,
  getCategoryByIdValidation,
  getCategoryBySlugValidation,
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation
} from "./category.validation.js";

import { validateRequest } from "../../middleware/validationHandler.js";

const router = Router();

router.get(
  "/",
  listCategoriesValidation,
  validateRequest,
  listCategories
);

router.get(
  "/slug/:slug",
  getCategoryBySlugValidation,
  validateRequest,
  getCategoryBySlug
);

router.get(
  "/:id",
  getCategoryByIdValidation,
  validateRequest,
  getCategoryById
);

router.post(
  "/",
  createCategoryValidation,
  validateRequest,
  createCategory
);

router.patch(
  "/:id",
  updateCategoryValidation,
  validateRequest,
  updateCategory
);

router.delete(
  "/:id",
  deleteCategoryValidation,
  validateRequest,
  deleteCategory
);

export default router;