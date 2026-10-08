import prisma from "../../config/prisma";

const productInclude = {
    product_categories: {
        include: {
            categories: true,
        },
    },
    product_variants: {
        include: {
            product_images: true,
        },
    },
    product_images: true,
};

const findUserById = async (id) => {
    return prisma.users.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            status: true,
        },
    });
};

const findProductBySlug = async (slug) => {
    return prisma.products.findUnique({
        where: {
            slug,
        },
        select: {
            id: true,
            slug: true,
        },
    });
};

const findCategoriesByIds = async (categoryIds) => {
    return prisma.categories.findMany({
        where: {
            id: {
                in: categoryIds,
            },
        },
        select: {
            id: true,
        },
    });
};

const findVariantsBySkus = async (skus) => {
    if (skus.length === 0) {
        return [];
    }

    return prisma.product_variants.findMany({
        where: {
            sku: {
                in: skus,
            },
        },
        select: {
            id: true,
            sku: true,
            product_id: true,
        },
    });
};
const findProductById = async (id) => {
    return prisma.products.findUnique({
        where: {
            id,
        },
        include: {
            product_categories: {
                include: {
                    categories: true,
                },
            },
            product_variants: {
                include: {
                    product_images: true,
                },
            },
            product_images: true,
            users: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                },
            },
        },
    });
};
const createProduct = async ({
    createdById,
    name,
    slug,
    description,
    status,
    categoryIds,
    variants,
}) => {
    return prisma.products.create({
        data: {
            created_by_id: createdById,
            name,
            slug,
            description,
            status,

            product_categories: {
                create: categoryIds.map((categoryId) => ({
                    categories: {
                        connect: {
                            id: categoryId,
                        },
                    },
                })),
            },

            product_variants:
                variants.length > 0
                    ? {
                        create: variants.map((variant) => ({
                            sku: variant.sku,
                            name: variant.name,
                            price: variant.price,
                            compare_at_price:
                                variant.compareAtPrice ?? null,
                            attributes: variant.attributes ?? null,
                            is_active: variant.isActive ?? true,
                        })),
                    }
                    : undefined,
        },
        include: productInclude,
    });
};
const findProducts = async ({
    skip,
    take,
    status,
    search,
}) => {
    const where = {
        ...(status
            ? {
                status,
            }
            : {}),

        ...(search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                        },
                    },
                    {
                        slug: {
                            contains: search,
                        },
                    },
                ],
            }
            : {}),
    };

    const [products, total] = await prisma.$transaction([
        prisma.products.findMany({
            where,
            skip,
            take,
            orderBy: [
                {
                    created_at: "desc",
                },
                {
                    id: "desc",
                },
            ],
            include: {
                product_categories: {
                    include: {
                        categories: true,
                    },
                },
                product_variants: {
                    include: {
                        product_images: true,
                    },
                },
                product_images: true,
            },
        }),

        prisma.products.count({
            where,
        }),
    ]);

    return {
        products,
        total,
    };
};

const updateProduct = async ({
    productId,
    data,
    categoryIds,
    shouldUpdateCategories,
}) => {
    return prisma.$transaction(async (tx) => {
        const product = await tx.products.update({
            where: {
                id: productId,
            },
            data,
        });

        if (shouldUpdateCategories) {
            await tx.product_categories.deleteMany({
                where: {
                    product_id: productId,
                },
            });

            if (categoryIds.length > 0) {
                await tx.product_categories.createMany({
                    data: categoryIds.map((categoryId) => ({
                        product_id: productId,
                        category_id: categoryId,
                    })),
                    skipDuplicates: true,
                });
            }
        }

        return tx.products.findUnique({
            where: {
                id: productId,
            },
            include: {
                product_categories: {
                    include: {
                        categories: true,
                    },
                },
                product_variants: {
                    include: {
                        product_images: true,
                    },
                },
                product_images: true,
            },
        });
    });
};
const deleteProduct = async (productId) => {
    return prisma.$transaction(async (tx) => {
        await tx.product_categories.deleteMany({
            where: {
                product_id: productId,
            },
        });

        await tx.product_images.deleteMany({
            where: {
                product_id: productId,
            },
        });

        await tx.product_variants.deleteMany({
            where: {
                product_id: productId,
            },
        });

        return tx.products.delete({
            where: {
                id: productId,
            },
        });
    });
};
const productRepository = {
    findUserById,
    findProductBySlug,
    findCategoriesByIds,
    findProductById,
    findVariantsBySkus,
    createProduct,
    findProducts,
    updateProduct,
    deleteProduct
};

export default productRepository;