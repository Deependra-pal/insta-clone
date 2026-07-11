/**
 * File Name: post.routes.js
 * Purpose: Routing definitions for post-related operations.
 * Responsibility: Maps endpoints for creating and fetching posts to their respective middlewares and controllers.
 */

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createPostValidation,
  validate,
} = require("../validations/post.validation");
const multer = require("multer");

// Configure multer storage: We use memory storage to keep files as buffers
// in order to upload them directly to ImageKit without writing them to disk.
const upload = multer({ storage: multer.memoryStorage() });

const postController = require("../controller/post.controller");

const router = express.Router();

/**
 * Route: POST /
 * Middlewares:
 *   - upload.single("image"): Parses a single uploaded file under the field name "image".
 *   - createPostValidation: Validates post request body fields (e.g., caption).
 *   - validate: Formats validation errors if validation fails.
 *   - authMiddleware: Verifies the user JWT token.
 * Controller: createPostController (Uploads image to ImageKit and saves post)
 */
router.post(
  "/",
  upload.single("image"),
  createPostValidation,
  validate,
  authMiddleware,
  postController.createPostController,
);

/**
 * Route: GET /
 * Middlewares:
 *   - authMiddleware: Verifies the user JWT token.
 * Controller: getPostController (Fetches all posts belonging to the authenticated user)
 */
router.get("/", authMiddleware, postController.getPostController);

// ========================================
// Get Single Post Controller
// Method: GET
// Route: /api/posts/:postId
// Access: Private
// Purpose: Retrieve a specific post created by the logged-in user.
// ========================================
router.get(
  "/details/:postId",
  authMiddleware,
  postController.getPostDeatilsController,
);

module.exports = router;
