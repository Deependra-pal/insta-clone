/**
 * File Name: post.validation.js
 * Purpose: Validation rules and middleware for post-related requests.
 * Responsibility: Validates the request body fields (like caption) and uploaded file presence using express-validator.
 */

const { body, validationResult } = require("express-validator");

/**
 * Validation Schema: createPostValidation
 * Purpose: Validates post creation body parameters.
 * Checks:
 *   - caption: Optional, must be under 500 characters.
 */
const createPostValidation = [
  body("caption")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Caption must be less than 500 characters"),
];

/**
 * Middleware Name: validateImage
 * Why it exists: To ensure that an image file is uploaded in the request.
 * What it checks: Checks if req.file is present.
 * What happens if validation/authentication fails: Responds with a 400 Bad Request if the file is missing.
 * Why next() is called: To pass control to the next handler if the image exists.
 */
const validateImage = (req, res, next) => {
  // 1. Check if the file is attached to the request
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image is required",
    });
  }

  // 2. Proceed to the next handler
  next();
};

/**
 * Middleware Name: validate
 * Why it exists: Evaluates the validation results from the validation array.
 * What it checks: Checks if there are any validation errors registered in express-validator.
 * What happens if validation/authentication fails: Returns a 400 Bad Request with an array of errors.
 * Why next() is called: To proceed to the target handler when no errors are found.
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

module.exports = { createPostValidation, validate };
