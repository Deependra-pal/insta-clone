/**
 * File Name: comment.routes.js
 * Purpose: Routing definitions for comment-related operations.
 * Responsibility: Maps endpoints for creating, retrieving, updating, and deleting comments.
 */

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { commentValidation, commentIdParamValidation, validate } = require("../validations/comment.validation");
const { postIdParamValidation } = require("../validations/post.validation");
const commentController = require("../controller/comment.controller");

const router = express.Router();

/**
 * Route: POST /posts/:postId/comments
 * Purpose: Create a comment on a specific post.
 */
router.post(
  "/posts/:postId/comments",
  authMiddleware,
  postIdParamValidation,
  commentValidation,
  validate,
  commentController.createCommentController
);

/**
 * Route: GET /posts/:postId/comments
 * Purpose: Retrieve comments for a specific post.
 */
router.get(
  "/posts/:postId/comments",
  authMiddleware,
  postIdParamValidation,
  validate,
  commentController.getCommentsController
);

/**
 * Route: PUT /comments/:commentId
 * Purpose: Update comment text.
 */
router.put(
  "/comments/:commentId",
  authMiddleware,
  commentIdParamValidation,
  commentValidation,
  validate,
  commentController.updateCommentController
);

/**
 * Route: DELETE /comments/:commentId
 * Purpose: Delete comment.
 */
router.delete(
  "/comments/:commentId",
  authMiddleware,
  commentIdParamValidation,
  validate,
  commentController.deleteCommentController
);

module.exports = router;
