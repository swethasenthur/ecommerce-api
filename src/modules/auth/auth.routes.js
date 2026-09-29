import { Router } from "express";
import {
  getMe,
  login,
  register
} from "./auth.controller.js";
import { validateLogin, validateRegister } from "./auth.validation.js";
import { authenticate } from "./authenticate.js";
import { requireRole } from "./authorize.js";
const router = Router();

router.post(
  "/register",
  validateRegister,
  register
);
router.post(
  "/login",
  validateLogin,
  login
);
router.get(
  "/me",
  authenticate,
  getMe
);
router.get(
  "/admin-test",
  authenticate,
  requireRole("ADMIN"),
  (req, res) => {
    return res.status(200).json({
      data: {
        message: "Admin access granted",
        userId: req.user.id,
        role: req.user.role
      }
    });
  }
);
export default router;