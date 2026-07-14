/**
 * File Name: comment.routes.js
 * Purpose: Routing definitions for comment-related operations.
 * Responsibility: Maps endpoints for creating, retrieving, updating, and deleting comments.
 */

const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const { commentValidation, validate } = require("../validations/comment.validation");
const commentController = require("../controller/comment.controller");

const router = express.Router();

/**
 * Route: POST /posts/:postId/comment
 * Middlewares:
 *   - authMiddleware: Verifies user JWT token.
 *   - commentValidation: Validates comment body text.
 *   - validate: Formats validation errors if validation fails.
 * Controller: createCommentController
 */
router.post(
  "/:postId/comment",
  authMiddleware,
  commentValidation,
  validate,
  commentController.createCommentController
);

/**
 * Route: GET /posts/:postId/comments
 * Middlewares:
 *   - authMiddleware: Verifies user JWT token.
 * Controller: getCommentsController
 */
router.get(
  "/:postId/comments",
  authMiddleware,
  commentController.getCommentsController
);

/**
 * Route: PATCH /comments/:commentId
 * Middlewares:
 *   - authMiddleware: Verifies user JWT token.
 *   - commentValidation: Validates updated comment body text.
 *   - validate: Formats validation errors if validation fails.
 * Controller: updateCommentController
 */
router.patch(
  "/comments/:commentId",
  authMiddleware,
  commentValidation,
  validate,
  commentController.updateCommentController
);

/**
 * Route: DELETE /comments/:commentId
 * Middlewares:
 *   - authMiddleware: Verifies user JWT token.
 * Controller: deleteCommentController
 */
router.delete(
  "/comments/:commentId",
  authMiddleware,
  commentController.deleteCommentController
);

module.exports = router;
