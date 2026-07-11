/**
 * File Name: user.validation.js
 * Purpose: Validation rules and middleware for user-related requests.
 * Responsibility: Defines rules for validating registration and login request bodies using express-validator.
 */

const { body, validationResult } = require("express-validator");

/**
 * Validation Schema: registerValidation
 * Purpose: Validates the body parameters required for user registration.
 * Checks:
 *   - username: Required, non-empty, whitespace-trimmed.
 *   - email: Required, non-empty, must be a valid email format, whitespace-trimmed.
 *   - password: Required, must be at least 8 characters.
 */
const registerValidation = [
  body("username").trim().notEmpty().withMessage("Username is required"),

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
 * Purpose: Validates the body parameters required for user login.
 * Checks:
 *   - password: Required, must be at least 8 characters.
 *   - body custom: Ensures either username or email is provided.
 *   - email: Optional, must be a valid email format.
 *   - username: Optional, must be at least 3 characters.
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
 * Middleware Name: validate
 * Why it exists: Evaluates the validation results from registration or login schemas.
 * What it checks: Checks if express-validator accumulated any validation errors.
 * What happens if validation/authentication fails: Responds with a 400 Bad Request and an array of errors.
 * Why next() is called: Transfers execution to the next controller/middleware when input validates successfully.
 */
const validate = (req, res, next) => {
  // 1. Gather all validation errors from the request
  const errors = validationResult(req);

  // 2. Check if errors array is not empty
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  // 3. Proceed to the next handler
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  validate,
};
