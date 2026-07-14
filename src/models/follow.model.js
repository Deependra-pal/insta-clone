const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Follower User ID is required"],
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Following User ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of the follow relationship
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Index on followingId to optimize "get followers" count/query operations
followSchema.index({ followingId: 1 });

const followModel = mongoose.model("Follow", followSchema);

module.exports = followModel;
