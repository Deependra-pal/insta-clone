/**
* File Name: comment.validation.js
* Purpose: Validate comment request body.
*/

const { body, validationResult } = require("express-validator");

/**
 * Validation Rules
 */
const commentValidation = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
];

/**
 * Validation Middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

module.exports = {
  commentValidation,
  validate,
};
