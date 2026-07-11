/**
 * File Name: auth.routes.js
 * Purpose: Routing definitions for user authentication.
 * Responsibility: Maps authentication endpoints (register, login, get-me, logout) to their respective validation middlewares, authentication middleware, and controllers.
 */

const express = require("express");
const authController = require("../controller/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { registerValidation, validate, loginValidation } = require("../validations/user.validation");

const router = express.Router();

/**
 * Route: POST /register
 * Middlewares:
 *   - registerValidation: Validates request fields (e.g., email, password, username).
 *   - validate: Checks validation results and returns errors if validations fail.
 * Controller: registerController (Processes user registration)
 */
router.post("/register", registerValidation, validate, authController.registerController);

/**
 * Route: POST /login
 * Middlewares:
 *   - loginValidation: Validates input fields (e.g., email, password).
 *   - validate: Checks validation results and returns errors if validations fail.
 * Controller: loginController (Processes user login and generates JWT)
 */
router.post("/login", loginValidation, validate, authController.loginController);

/**
 * Route: GET /get-me
 * Middlewares:
 *   - authMiddleware: Verifies the user's JWT and extracts the user ID.
 * Controller: getMeController (Retrieves authenticated user details)
 */
router.get("/get-me", authMiddleware, authController.getMeController);

/**
 * Route: POST /logout
 * Middlewares:
 *   - authMiddleware: Verifies the user's JWT.
 * Controller: logoutController (Clears authentication token from cookies)
 */
router.post("/logout", authMiddleware, authController.logoutController);

module.exports = router;
