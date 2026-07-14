/**
 * File Name: user.controller.js
 * Purpose: Controller definitions for user-related actions.
 * Responsibility: Handles requests for getting user profiles, updating profiles, and following/unfollowing users.
 */

const userModel = require("../models/user.model");
const followModel = require("../models/follow.model");

/**
 * Controller Name: getUserProfileController
 * HTTP Method: GET
 * Route: /api/users/:userId
 * Access: Private (Requires JWT Auth)
 * Purpose: Retrieve public profile data of a user by their user ID.
 */
const getUserProfileController = async (req, res) => {
  try {
    // 1. Retrieve the userId from request parameters
    const { userId } = req.params;

    // 2. Query MongoDB for the user with the given ID
    // - Select all fields except the password for security
    // - Populate 'posts' to return the user's posts
    const user = await userModel.findById(userId)
      .select("-password")
      .populate("posts");

    // 3. If user is not found, return 404 Not Found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // 4. Determine relation flags
    // - isMe: true if the requested profile belongs to the logged-in user
    const isMe = user._id.toString() === req.userId.toString();

    // - isFollowing: true if the logged-in user is following the target user
    const isFollowing = await followModel.exists({
      followerId: req.userId,
      followingId: userId,
    });

    // - Count followers and following using Follow model
    const followersCount = await followModel.countDocuments({ followingId: userId });
    const followingCount = await followModel.countDocuments({ followerId: userId });

    // 5. Send successful response with user details in standard format
    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: {
        user: {
          _id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          followersCount,
          followingCount,
          postsCount: user.posts.length,
          posts: user.posts,
          isMe,
          isFollowing: !!isFollowing,
        },
      },
    });
  } catch (error) {
    // 6. Catch any server errors and respond in standard format
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      data: null,
    });
  }
};

/**
 * Controller Name: updateUserProfileController
 * HTTP Method: PUT
 * Route: /api/users/profile
 * Access: Private (Requires JWT Auth)
 * Purpose: Allows the authenticated user to update their own profile fields.
 */
const updateUserProfileController = async (req, res) => {
  try {
    // 1. Retrieve fields to update from the request body
    const { fullname, bio, profilePicture } = req.body;
    const userId = req.userId;

    // 2. Query and update the user document in MongoDB
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(fullname && { fullname }),
          ...(bio !== undefined && { bio }),
          ...(profilePicture && { profilePicture }),
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // 3. Send standardized success response
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      data: null,
    });
  }
};

/**
 * Controller Name: followUnfollowUserController
 * HTTP Method: POST
 * Route: /api/users/:userId/follow
 * Access: Private (Requires JWT Auth)
 * Purpose: Toggles follow/unfollow status between logged-in user and target user.
 */
const followUnfollowUserController = async (req, res) => {
  try {
    const loggedInUserId = req.userId;
    const targetUserId = req.params.userId;

    // 1. Prevent users from following themselves
    if (loggedInUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
        data: null,
      });
    }

    // 2. Retrieve target user profile (to verify existence)
    const targetUser = await userModel.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // 3. Determine if the logged-in user is already following the target user
    const existingFollow = await followModel.findOne({
      followerId: loggedInUserId,
      followingId: targetUserId,
    });

    let message = "";

    if (existingFollow) {
      // Unfollow flow: Remove follow document
      await followModel.deleteOne({ _id: existingFollow._id });
      message = "Unfollowed user successfully";
    } else {
      // Follow flow: Create new follow document
      await followModel.create({
        followerId: loggedInUserId,
        followingId: targetUserId,
      });
      message = "Followed user successfully";
    }

    // 4. Send standardized response
    return res.status(200).json({
      success: true,
      message,
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      data: null,
    });
  }
};

module.exports = {
  getUserProfileController,
  updateUserProfileController,
  followUnfollowUserController,
};
