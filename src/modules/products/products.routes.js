import express from "express";
import productsController from "./products.controller.js";
import { authenticate } from "../auth/authenticate.js";
import { validateProductId, validateCreateProduct } from "./products.validations.js";

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


export default router;