import { body, param, query } from "express-validator";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const uuidRule = (field) =>
  param(field)
    .trim()
    .matches(guidPattern)
    .withMessage(`${field} must be a valid UUID`);

const rejectUnknownBodyFields = (allowedFields) => (req, res, next) => {
  const body = req.body ?? {};

  if (typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      error: "Request body must be a JSON object"
    });
  }

  const unknownFields = Object.keys(body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (unknownFields.length > 0) {
    return res.status(400).json({
      error: "Unknown fields are not allowed",
      fields: unknownFields
    });
  }

  next();
};

export const listCategoriesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer")
    .toInt(),

  query("pageSize")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("pageSize must be between 1 and 100")
    .toInt(),

  query("parentId")
    .optional({ values: "falsy" })
    .isUUID()
    .withMessage("parentId must be a valid UUID"),

  query("includeChildren")
    .optional()
    .isBoolean()
    .withMessage("includeChildren must be true or false")
    .toBoolean()
];

export const getCategoryByIdValidation = [
  uuidRule("id")
];

export const getCategoryBySlugValidation = [
  param("slug")
    .matches(slugPattern)
    .withMessage("slug must contain lowercase letters, numbers, and hyphens")
];

export const createCategoryValidation = [
  rejectUnknownBodyFields(["name", "slug", "description", "parentId"]),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ max: 150 })
    .withMessage("name must be at most 150 characters"),

  body("slug")
    .optional({ values: "falsy" })
    .trim()
    .matches(slugPattern)
    .withMessage(
      "slug must contain lowercase letters, numbers, and hyphens"
    )
    .isLength({ max: 180 })
    .withMessage("slug must be at most 180 characters"),

  body("description")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("description must be at most 500 characters"),

  body("parentId")
    .optional({ values: "falsy" })
    .isUUID()
    .withMessage("parentId must be a valid UUID")
];

export const updateCategoryValidation = [
  uuidRule("id"),

  rejectUnknownBodyFields(["name", "slug", "description", "parentId"]),

  body()
    .custom((value) => Object.keys(value).length > 0)
    .withMessage("at least one field is required"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("name cannot be empty")
    .isLength({ max: 150 })
    .withMessage("name must be at most 150 characters"),

  body("slug")
    .optional()
    .trim()
    .matches(slugPattern)
    .withMessage(
      "slug must contain lowercase letters, numbers, and hyphens"
    )
    .isLength({ max: 180 })
    .withMessage("slug must be at most 180 characters"),

  body("description")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("description must be at most 500 characters"),

  body("parentId")
    .optional({ values: "null" })
    .custom((value) => value === null || /^[0-9a-f-]{36}$/i.test(value))
    .withMessage("parentId must be null or a valid UUID")
];

export const deleteCategoryValidation = [
  uuidRule("id")
];