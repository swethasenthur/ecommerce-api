import productService from "./products.services";
const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct({
            input: req.body,
            authenticatedUserId: req.user.id,
        });

        return res.status(201).json({
            data: product,
        });
    } catch (error) {
        next(error);
    }
};
const getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(
            req.params.id
        );

        return res.status(200).json({
            data: product,
        });
    } catch (error) {
        next(error);
    }
};
const listProducts = async (req, res, next) => {
    try {
        const result = await productService.listProducts({
            page: req.query.page,
            limit: req.query.limit,
            status: req.query.status,
            search: req.query.search,
        });

        return res.status(200).json({
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};
const updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct({
            productId: req.params.id,
            input: req.body,
            authenticatedUserId: req.user.id,
        });

        return res.status(200).json({
            data: product,
        });
    } catch (error) {
        next(error);
    }
};
const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct({
            productId: req.params.id,
            authenticatedUserId: req.user.id,
        });

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};
export default {
    createProduct,
    getProductById,
    listProducts,
    updateProduct,
    deleteProduct
};