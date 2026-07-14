/**
 * File Name: user.validation.js
 * Purpose: Validation rules and middleware for user-related requests.
 * Responsibility: Defines rules for validating registration, login, and profile parameters.
 */

const { body, param, validationResult } = require("express-validator");

/**
 * Validation Schema: registerValidation
 */
const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isAlphanumeric()
    .withMessage("Username must be alphanumeric"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

/**
 * Validation Schema: loginValidation
 */
const loginValidation = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body().custom((value) => {
    if (!value.username && !value.email) {
      throw new Error("Username or Email is required");
    }
    return true;
  }),

  body("email").optional().trim().isEmail().withMessage("Invalid email format"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
];

/**
 * Validation Schema: userIdParamValidation
 * Purpose: Validates MongoDB ObjectIds passed in route parameters.
 */
const userIdParamValidation = [
  param("userId")
    .trim()
    .notEmpty()
    .withMessage("User ID parameter is required")
    .isMongoId()
    .withMessage("Invalid User ID format"),
];

/**
 * Middleware Name: validate
 * Why it exists: Evaluates the validation results.
 * What happens if validation fails: Responds with a 400 Bad Request and standardized JSON structure.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      data: { errors: errors.array() },
    });
  }

  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  userIdParamValidation,
  validate,
};
