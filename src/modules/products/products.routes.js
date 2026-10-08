import express from "express";
import productsController from "./products.controller.js";
import { authenticate } from "../auth/authenticate.js";
import { requireRole } from "../auth/authorize.js";
import { validateProductId, validateProductListQuery, validateCreateProduct, validateUpdateProduct } from "./products.validations.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    validateCreateProduct,
    productsController.createProduct
);
router.get(
    "/:id",
    authenticate,
    validateProductId,
    productsController.getProductById
);
router.get(
    "/",
    authenticate,
    validateProductListQuery,
    productsController.listProducts
);


router.patch(
    "/:id",
    authenticate,
    requireRole("ADMIN", "CATALOG_MANAGER"),
    validateProductId,
    validateUpdateProduct,
    productsController.updateProduct
);

router.delete(
    "/:id",
    authenticate,
    requireRole("ADMIN", "CATALOG_MANAGER"),
    validateProductId,
    productsController.deleteProduct
);
export default router;