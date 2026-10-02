import { body } from "express-validator";
import { validateRequest } from "../../middleware/validationHandler.js";

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;

export const validateRegister = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("email must be a valid email address")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("password must be a string")
    .isLength({
      min: PASSWORD_MIN_LENGTH,
      max: PASSWORD_MAX_LENGTH
    })
    .withMessage(
      `password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`
    ),

  body("firstName")
    .trim()
    .isString()
    .withMessage("firstName must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("firstName must be between 1 and 100 characters"),

  body("lastName")
    .trim()
    .isString()
    .withMessage("lastName must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("lastName must be between 1 and 100 characters"),

  validateRequest
];

export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("email must be a valid email address")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("password must be a string")
    .notEmpty()
    .withMessage("password is required"),

  validateRequest
];
export const validateRefresh = [
  body("refreshToken")
    .isString()
    .withMessage("refreshToken must be a string")
    .notEmpty()
    .withMessage("refreshToken is required"),

  validateRequest
];