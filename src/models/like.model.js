const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: [true, "Post ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only like a specific post once
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

const likeModel = mongoose.model("Like", likeSchema);

module.exports = likeModel;
