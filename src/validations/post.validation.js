const { body, validationResult } = require("express-validator");

const createPostValidation = [
  body("image").notEmpty().withMessage("Image is required"),

  body("caption")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Caption must be less than 500 characters"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

module.exports = { createPostValidation, validate };
