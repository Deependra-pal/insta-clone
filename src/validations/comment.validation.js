/**
 * File Name: comment.validation.js
 * Purpose: Validate comment requests.
 * Responsibility: Outlines criteria for comments and validates comment IDs.
 */

const { body, param, validationResult } = require("express-validator");

/**
 * Validation Schema: commentValidation
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
 * Validation Schema: commentIdParamValidation
 */
const commentIdParamValidation = [
  param("commentId")
    .trim()
    .notEmpty()
    .withMessage("Comment ID is required")
    .isMongoId()
    .withMessage("Invalid Comment ID format"),
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
      data: { errors: errors.array() },
    });
  }

  next();
};

module.exports = {
  commentValidation,
  commentIdParamValidation,
  validate,
};
