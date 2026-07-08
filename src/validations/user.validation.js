const { body, validationResult } = require("express-validator");

// Register Validation Rules
const registerValidation = [
  body("username")
  .trim()
  .notEmpty()
  .withMessage("Username is required"),

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

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
];

// Validation Error Middleware
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


module.exports = {
  registerValidation,
  loginValidation,
  validate,
};
