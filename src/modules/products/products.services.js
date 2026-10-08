import productRepository from "./products.repository.js";
const PRODUCT_STATUSES = [
    "DRAFT",
    "ACTIVE",
    "INACTIVE",
    "ARCHIVED",
];
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
const normalizeInput = (input) => {
    const categoryIds = [
        ...new Set(input.categoryIds),
    ];

    const variants = (input.variants || []).map((variant) => ({
        sku: variant.sku.trim(),
        name: variant.name.trim(),
        price: Number(variant.price),
        compareAtPrice:
            variant.compareAtPrice === undefined ||
                variant.compareAtPrice === null
                ? null
                : Number(variant.compareAtPrice),
        attributes: variant.attributes ?? null,
        isActive: variant.isActive ?? true,
    }));

    return {
        name: input.name.trim(),
        slug: input.slug.trim().toLowerCase(),
        description: input.description?.trim() || null,
        status: input.status || "DRAFT",
        categoryIds,
        variants,
    };
};
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
    }
}


function toProductResponse(product) {
    const response = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        status: product.status,
        createdById: product.created_by_id,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,

        categories: product.product_categories.map(
            (relation) => relation.categories
        ),

        variants: product.product_variants,
        images: product.product_images,
    };

    return response;
}

function createApplicationError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

const validateBusinessRules = async ({
    data,
    authenticatedUserId,
}) => {
    if (!authenticatedUserId) {
        throw new AppError(
            "Authenticated user is required",
            401
        );
    }

    if (!PRODUCT_STATUSES.includes(data.status)) {
        throw new AppError("Invalid product status", 400);
    }

    const user = await productRepository.findUserById(
        authenticatedUserId
    );
    if (!user) {
        throw new AppError(
            "Authenticated user was not found",
            401
        );
    }

    if (user.status !== "ACTIVE") {
        throw new AppError(
            "Authenticated user is not active",
            403
        );
    }

    const existingProduct =
        await productRepository.findProductBySlug(data.slug);

    if (existingProduct) {
        throw new AppError(
            "Product slug already exists",
            409
        );
    }

    const categories =
        await productRepository.findCategoriesByIds(
            data.categoryIds
        );

    if (categories.length !== data.categoryIds.length) {
        throw new AppError(
            "One or more categories were not found",
            404
        );
    }

    const variantSkus = data.variants.map(
        (variant) => variant.sku
    );

    const existingVariants =
        await productRepository.findVariantsBySkus(
            variantSkus
        );

    if (existingVariants.length > 0) {
        const duplicateSkus = existingVariants.map(
            (variant) => variant.sku
        );

        throw new AppError(
            `Variant SKU already exists: ${duplicateSkus.join(", ")}`,
            409
        );
    }
};
const createProduct = async ({
    input,
    authenticatedUserId,
}) => {
    const data = normalizeInput(input);

    await validateBusinessRules({
        data,
        authenticatedUserId,
    });

    const product = await productRepository.createProduct({
        createdById: authenticatedUserId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        status: data.status,
        categoryIds: data.categoryIds,
        variants: data.variants,
    });
    return toProductResponse(product);
};
const isValidGuid = (value) => {
    const guidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    return guidPattern.test(value);
};

const getProductById = async (id) => {

    const product = await productRepository.findProductById(id);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return toProductResponse(product);
};
const listProducts = async ({
    page = 1,
    limit = 20,
    status,
    search,
}) => {
    const skip = (page - 1) * limit;

    const result = await productRepository.findProducts({
        skip,
        take: Number(limit),
        status,
        search,
    });

    const totalPages =
        result.total === 0
            ? 0
            : Math.ceil(result.total / limit);

    return {
        data: result.products.map(toProductResponse),

        pagination: {
            page,
            limit,
            totalItems: result.total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};
const updateProduct = async ({
    productId,
    input,
    authenticatedUserId,
}) => {
    const existingProduct =
        await productRepository.findProductById(productId);

    if (!existingProduct) {
        throw new AppError("Product not found", 404);
    }

    const data = {};

    if (input.name !== undefined) {
        data.name = input.name.trim();
    }

    if (input.slug !== undefined) {
        const normalizedSlug = input.slug
            .trim()
            .toLowerCase();

        const productWithSlug =
            await productRepository.findProductBySlug(
                normalizedSlug
            );

        if (
            productWithSlug &&
            productWithSlug.id !== productId
        ) {
            throw new AppError(
                "Product slug already exists",
                409
            );
        }

        data.slug = normalizedSlug;
    }

    if (input.description !== undefined) {
        data.description = input.description
            ? input.description.trim()
            : null;
    }

    if (input.status !== undefined) {
        data.status = input.status;
    }

    const shouldUpdateCategories =
        Object.prototype.hasOwnProperty.call(
            input,
            "categoryIds"
        );

    let categoryIds = [];

    if (shouldUpdateCategories) {
        categoryIds = [
            ...new Set(input.categoryIds),
        ];

        const categories =
            await productRepository.findCategoriesByIds(
                categoryIds
            );

        if (categories.length !== categoryIds.length) {
            throw new AppError(
                "One or more categories were not found",
                404
            );
        }
    }

    const updatedProduct =
        await productRepository.updateProduct({
            productId,
            data,
            categoryIds,
            shouldUpdateCategories,
        });

    return toProductResponse(updatedProduct);
};
const deleteProduct = async ({
    productId,
    authenticatedUserId,
}) => {
    const existingProduct =
        await productRepository.findProductById(productId);

    if (!existingProduct) {
        throw new AppError("Product not found", 404);
    }

    await productRepository.deleteProduct(productId);
};
export default {
    createProduct,
    getProductById,
    listProducts,
    updateProduct,
    deleteProduct
};