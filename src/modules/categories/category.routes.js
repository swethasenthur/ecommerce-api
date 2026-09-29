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
import { authenticate } from "../auth/authenticate.js";
import { requireRole } from "../auth/authorize.js";

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
  authenticate,
  requireRole("ADMIN"),
  createCategoryValidation,
  validateRequest,
  createCategory
);

router.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  updateCategoryValidation,
  validateRequest,
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  deleteCategoryValidation,
  validateRequest,
  deleteCategory
);

export default router;