/**
 * File Name: auth.routes.js
 * Purpose: Routing definitions for user authentication.
 * Responsibility: Maps authentication endpoints (register, login, get-me, logout) to their respective validations and controllers.
 */

const express = require("express");
const authController = require("../controller/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { registerValidation, validate, loginValidation } = require("../validations/user.validation");

const router = express.Router();

/**
 * Route: POST /register
 * Purpose: Register a new user account.
 */
router.post(
  "/register",
  registerValidation,
  validate,
  authController.registerController
);

/**
 * Route: POST /login
 * Purpose: Authenticate user credentials and return a session token.
 */
router.post(
  "/login",
  loginValidation,
  validate,
  authController.loginController
);

/**
 * Route: GET /get-me
 * Purpose: Retrieves current authenticated user session data.
 */
router.get(
  "/get-me",
  authMiddleware,
  authController.getMeController
);

/**
 * Route: POST /logout
 * Purpose: Log out user and clear authorization cookies.
 */
router.post(
  "/logout",
  authMiddleware,
  authController.logoutController
);

module.exports = router;
