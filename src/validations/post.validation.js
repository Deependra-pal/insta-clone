/**
 * File Name: post.validation.js
 * Purpose: Validation rules and middleware for post-related requests.
 * Responsibility: Validates body fields, file presence, and route parameters.
 */

const { body, param, validationResult } = require("express-validator");

/**
 * Validation Schema: createPostValidation
 */
const createPostValidation = [
  body("caption")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Caption must be less than 500 characters"),
];

/**
 * Validation Schema: postIdParamValidation
 * Purpose: Validates MongoDB ObjectId passed as a route parameter.
 */
const postIdParamValidation = [
  param("postId")
    .trim()
    .notEmpty()
    .withMessage("Post ID is required")
    .isMongoId()
    .withMessage("Invalid Post ID format"),
];

/**
 * Middleware Name: validateImage
 * Purpose: Ensures an image file is uploaded in the request.
 */
const validateImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image is required",
      data: null,
    });
  }

  // Basic MIME type validation for security
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file format. Only JPEG, PNG, and WEBP images are allowed.",
      data: null,
    });
  }

  next();
};

/**
 * Middleware Name: validate
 * Purpose: Formats validation errors if validation fails.
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
  createPostValidation,
  postIdParamValidation,
  validateImage,
  validate,
};
