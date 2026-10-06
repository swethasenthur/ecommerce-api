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
export default {
    createProduct,
    getProductById
};