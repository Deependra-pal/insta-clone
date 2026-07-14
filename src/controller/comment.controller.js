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
 * Route: /api/posts/:postId/comments
 * Access: Private (Requires JWT Auth)
 * Purpose: Allow a logged-in user to add a comment to a post.
 */
const createCommentController = async (req, res) => {
  try {
    const userId = req.userId;
    const postId = req.params.postId;
    const { text } = req.body;

    // 1. Find the post by ID
    const post = await postModel.findById(postId);

    // 2. Return 404 if the post does not exist
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
        data: null,
      });
    }

    // 3. Create and save new Comment document
    const comment = new commentModel({
      text,
      postId,
      userId,
    });
    await comment.save();

    // 4. Push the comment ObjectId into the Post.comments array and save
    post.comments.push(comment._id);
    await post.save();

    // 5. Return success response in standardized format
    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: { comment },
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
 * Function Name: getCommentsController
 * HTTP Method: GET
 * Route: /api/posts/:postId/comments
 * Access: Private (Requires JWT Auth)
 * Purpose: Fetch all comments of a specific post.
 */
const getCommentsController = async (req, res) => {
  try {
    const postId = req.params.postId;

    // 1. Find Post
    const post = await postModel.findById(postId);

    // 2. Return 404 if not found
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
        data: null,
      });
    }

    // 3. Populate comments
    await post.populate({
      path: "comments",
      populate: {
        path: "userId",
        select: "username fullname profilePicture",
      },
    });

    // 4. Return comments in standardized format
    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: { comments: post.comments },
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
 * Function Name: updateCommentController
 * HTTP Method: PUT
 * Route: /api/comments/:commentId
 * Access: Private (Requires JWT Auth)
 * Purpose: Allow only the comment owner to update their comment.
 */
const updateCommentController = async (req, res) => {
  try {
    const userId = req.userId;
    const commentId = req.params.commentId;
    const { text } = req.body;

    // 1. Find Comment
    const comment = await commentModel.findById(commentId);

    // 2. Return 404 if not found
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
        data: null,
      });
    }

    // 3. Check ownership
    if (!comment.userId.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this comment",
        data: null,
      });
    }

    // 4. Update comment text and save
    comment.text = text;
    await comment.save();

    // 5. Return success response
    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: { comment },
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
 * Function Name: deleteCommentController
 * HTTP Method: DELETE
 * Route: /api/comments/:commentId
 * Access: Private (Requires JWT Auth)
 * Purpose: Allow only the comment owner to delete their comment.
 */
const deleteCommentController = async (req, res) => {
  try {
    const userId = req.userId;
    const commentId = req.params.commentId;

    // 1. Find Comment
    const comment = await commentModel.findById(commentId);

    // 2. Return 404 if not found
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
        data: null,
      });
    }

    // 3. Check ownership
    if (!comment.userId.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
        data: null,
      });
    }

    // 4. Remove comment ObjectId from Post.comments array
    const post = await postModel.findById(comment.postId);
    if (post) {
      post.comments.pull(commentId);
      await post.save();
    }

    // 5. Delete Comment document
    await comment.deleteOne();

    // 6. Return success response
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
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
  createCommentController,
  getCommentsController,
  updateCommentController,
  deleteCommentController,
};
