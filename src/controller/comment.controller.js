/**
 * File Name: comment.controller.js
 * Purpose: Handles request and response logic for comment-related operations.
 * Responsibility: Creating, retrieving, updating, and deleting comments.
 */

const commentModel = require("../models/comment.model");
const postModel = require("../models/post.model");

/**
 * Function Name: createCommentController
 * HTTP Method: POST
 * Route: /api/posts/:postId/comment
 * Access: Private
 * Purpose: Allow a logged-in user to add a comment to a post.
 */
const createCommentController = async (req, res) => {
  try {
    // 1. Get Logged-in User ID from auth middleware (req.userId)
    const userId = req.userId;

    // 2. Get Post ID from request params
    const postId = req.params.postId;

    // 3. Get comment text from request body
    const { text } = req.body;

    // 4. Find the post by ID
    const post = await postModel.findById(postId);

    // 5. Return 404 if the post does not exist
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 6. Create a new Comment document
    const comment = new commentModel({
      text,
      postId,
      userId,
    });

    // 7. Save the comment in MongoDB
    await comment.save();

    // 8. Push the comment ObjectId into the Post.comments array
    post.comments.push(comment._id);

    // 9. Save the post
    await post.save();

    // 10. Return success response
    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    // 11. Handle server errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Function Name: getCommentsController
 * HTTP Method: GET
 * Route: /api/posts/:postId/comments
 * Access: Private
 * Purpose: Fetch all comments of a specific post.
 */
const getCommentsController = async (req, res) => {
  try {
    // 1. Get Post ID
    const postId = req.params.postId;

    // 2. Find Post
    const post = await postModel.findById(postId);

    // 3. Return 404 if not found
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 4. Populate comments (along with commenter details)
    await post.populate({
      path: "comments",
      populate: {
        path: "userId",
        select: "username fullname profilePicture",
      },
    });

    // 5. Return comments
    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      comments: post.comments,
    });
  } catch (error) {
    // Handle server errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Function Name: updateCommentController
 * HTTP Method: PATCH
 * Route: /api/comments/:commentId
 * Access: Private
 * Purpose: Allow only the comment owner to update their comment.
 */
const updateCommentController = async (req, res) => {
  try {
    // 1. Get Logged-in User ID
    const userId = req.userId;

    // 2. Get Comment ID
    const commentId = req.params.commentId;

    // 3. Find Comment
    const comment = await commentModel.findById(commentId);

    // 4. Return 404 if not found
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // 5. Check ownership (compare ObjectIds using Mongoose best practices)
    if (!comment.userId.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this comment",
      });
    }

    // 6. Update comment text
    comment.text = req.body.text;

    // 7. Save comment
    await comment.save();

    // 8. Return success response
    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    // Handle server errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Function Name: deleteCommentController
 * HTTP Method: DELETE
 * Route: /api/comments/:commentId
 * Access: Private
 * Purpose: Allow only the comment owner to delete their comment.
 */
const deleteCommentController = async (req, res) => {
  try {
    // 1. Get Logged-in User ID
    const userId = req.userId;

    // 2. Get Comment ID
    const commentId = req.params.commentId;

    // 3. Find Comment
    const comment = await commentModel.findById(commentId);

    // 4. Return 404 if not found
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // 5. Check ownership (compare ObjectIds using Mongoose best practices)
    if (!comment.userId.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }

    // 6. Remove comment ObjectId from Post.comments array
    const post = await postModel.findById(comment.postId);
    if (post) {
      post.comments.pull(commentId);
      await post.save();
    }

    // 7. Delete Comment document
    await comment.deleteOne();

    // 8. Return success response
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    // Handle server errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCommentController,
  getCommentsController,
  updateCommentController,
  deleteCommentController,
};
