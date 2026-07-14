/**
 * File Name: comment.model.js
 * Purpose: Defines the Schema and Model for Comments.
 * Responsibility: Outlines standard database structure for post comments, referencing users and posts.
 */

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    // Comment text
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },

    // Post on which the comment is made
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post", // Model name should match your Post model
      required: [true, "Post ID is required"],
    },

    // User who wrote the comment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Model name should match your User model
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

const commentModel = mongoose.model("Comment", commentSchema);

module.exports = commentModel;
