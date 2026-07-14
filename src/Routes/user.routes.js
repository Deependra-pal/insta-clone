/**
 * File Name: user.routes.js
 * Purpose: Routing definitions for user-related operations.
 * Responsibility: Maps endpoints for getting profiles, updating details, and follow/unfollow actions.
 */

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { userIdParamValidation, validate } = require("../validations/user.validation");
const userController = require("../controller/user.controller");

const router = express.Router();

/**
 * Route: GET /:userId
 * Purpose: Retrieve a user's profile details.
 */
router.get(
  "/:userId",
  authMiddleware,
  userIdParamValidation,
  validate,
  userController.getUserProfileController
);

/**
 * Route: PUT /profile
 * Purpose: Update authenticated user profile fields.
 */
router.put(
  "/profile",
  authMiddleware,
  userController.updateUserProfileController
);

/**
 * Route: POST /:userId/follow
 * Purpose: Toggle follow/unfollow status for a target user.
 */
router.post(
  "/:userId/follow",
  authMiddleware,
  userIdParamValidation,
  validate,
  userController.followUnfollowUserController
);

module.exports = router;
