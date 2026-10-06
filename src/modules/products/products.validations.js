import {
    body,
    param,
    validationResult,
} from "express-validator";

const guidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const allowedStatuses = [
    "DRAFT",
    "ACTIVE",
    "INACTIVE",
    "ARCHIVED",
];

const allowedFields = new Set([
    "name",
    "slug",
    "description",
    "status",
    "categoryIds",
    "variants",
]);

const validateUnknownFields = (req, res, next) => {
    const unknownFields = Object.keys(req.body).filter(
        (field) => !allowedFields.has(field)
    );

    if (unknownFields.length > 0) {
        return res.status(400).json({
            error: "Validation failed",
            details: unknownFields.map((field) => ({
                field,
                message: `Unknown field: ${field}`,
            })),
        });
    }

    next();
};

const validateVariants = body("variants")
    .optional()
    .isArray()
    .withMessage("variants must be an array")
    .custom((variants) => {
        const skus = new Set();

        for (const variant of variants) {
            if (!variant || typeof variant !== "object") {
                throw new Error("Each variant must be an object");
            }

            if (
                typeof variant.sku !== "string" ||
                variant.sku.trim().length === 0
            ) {
                throw new Error("Each variant requires a SKU");
            }

            const sku = variant.sku.trim();

            if (skus.has(sku)) {
                throw new Error(
                    "Variant SKUs must be unique within the request"
                );
            }

            skus.add(sku);

            if (
                typeof variant.name !== "string" ||
                variant.name.trim().length === 0
            ) {
                throw new Error("Each variant requires a name");
            }

            const price = Number(variant.price);

            if (!Number.isFinite(price) || price < 0) {
                throw new Error(
                    "Each variant price must be a non-negative number"
                );
            }

            if (
                variant.compareAtPrice !== undefined &&
                variant.compareAtPrice !== null
            ) {
                const compareAtPrice = Number(
                    variant.compareAtPrice
                );

                if (
                    !Number.isFinite(compareAtPrice) ||
                    compareAtPrice < 0
                ) {
                    throw new Error(
                        "compareAtPrice must be a non-negative number"
                    );
                }
            }

            if (
                variant.attributes !== undefined &&
                variant.attributes !== null &&
                typeof variant.attributes !== "string"
            ) {
                throw new Error("attributes must be a string");
            }

            if (
                variant.isActive !== undefined &&
                typeof variant.isActive !== "boolean"
            ) {
                throw new Error("isActive must be boolean");
            }
        }

        return true;
    });

const returnValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: "Validation failed",
            details: errors.array(),
        });
    }

    next();
};

const validateCreateProduct = [
    validateUnknownFields,

    body("name")
        .exists()
        .withMessage("name is required")
        .bail()
        .isString()
        .withMessage("name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("name must not be empty")
        .bail()
        .isLength({ max: 200 })
        .withMessage("name must not exceed 200 characters"),

    body("slug")
        .exists()
        .withMessage("slug is required")
        .bail()
        .isString()
        .withMessage("slug must be a string")
        .bail()
        .trim()
        .toLowerCase()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage(
            "slug must contain lowercase letters, numbers, and hyphens"
        )
        .isLength({ max: 220 })
        .withMessage("slug must not exceed 220 characters"),

    body("description")
        .optional({ nullable: true })
        .isString()
        .withMessage("description must be a string")
        .bail()
        .isLength({ max: 4000 })
        .withMessage(
            "description must not exceed 4000 characters"
        )
        .trim(),

    body("status")
        .optional()
        .isString()
        .withMessage("status must be a string")
        .bail()
        .isIn(allowedStatuses)
        .withMessage(
            `status must be one of: ${allowedStatuses.join(", ")}`
        ),

    body("categoryIds")
        .exists()
        .withMessage("categoryIds is required")
        .bail()
        .isArray({ min: 1 })
        .withMessage(
            "categoryIds must contain at least one category"
        )
        .custom((categoryIds) => {
            const uniqueCategoryIds = new Set(categoryIds);

            if (uniqueCategoryIds.size !== categoryIds.length) {
                throw new Error(
                    "categoryIds must not contain duplicates"
                );
            }

            for (const categoryId of categoryIds) {
                if (
                    typeof categoryId !== "string" ||
                    !guidPattern.test(categoryId)
                ) {
                    throw new Error(
                        "Every categoryId must be a valid GUID"
                    );
                }
            }

            return true;
        }),

    validateVariants,

    returnValidationErrors,
];
const validateProductId = [
    param("id")
        .exists()
        .withMessage("Product ID is required")
        .bail()
        .matches(guidPattern)
        .withMessage("Product ID must be a valid GUID"),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: "Validation failed",
                details: errors.array(),
            });
        }

        next();
    },
];
export {
    validateCreateProduct,
    validateProductId
};