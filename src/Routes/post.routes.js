/**
 * File Name: post.routes.js
 * Purpose: Routing definitions for post-related operations.
 * Responsibility: Maps endpoints for creating, retrieving, liking, updating, and deleting posts.
 */

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createPostValidation,
  postIdParamValidation,
  validateImage,
  validate,
} = require("../validations/post.validation");
const multer = require("multer");

// Configure multer storage: We use memory storage to keep files as buffers
const upload = multer({ storage: multer.memoryStorage() });

const postController = require("../controller/post.controller");

const router = express.Router();

/**
 * Route: POST /
 * Purpose: Create a new post.
 */
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  validateImage,
  createPostValidation,
  validate,
  postController.createPostController
);

/**
 * Route: GET /
 * Purpose: Retrieve all posts belonging to the authenticated user.
 */
router.get(
  "/",
  authMiddleware,
  postController.getPostController
);

/**
 * Route: GET /:postId
 * Purpose: Retrieve details of a specific post.
 */
router.get(
  "/:postId",
  authMiddleware,
  postIdParamValidation,
  validate,
  postController.getPostDeatilsController
);

/**
 * Route: PUT /:postId
 * Purpose: Update post caption.
 */
router.put(
  "/:postId",
  authMiddleware,
  postIdParamValidation,
  createPostValidation,
  validate,
  postController.updatePostController
);

/**
 * Route: DELETE /:postId
 * Purpose: Delete a post and its image on CDN.
 */
router.delete(
  "/:postId",
  authMiddleware,
  postIdParamValidation,
  validate,
  postController.deletePostController
);

/**
 * Route: POST /:postId/like
 * Purpose: Toggle like status of a post.
 */
router.post(
  "/:postId/like",
  authMiddleware,
  postIdParamValidation,
  validate,
  postController.likeController
);

module.exports = router;
