const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "image is require for creating post"],
      trim: true,
    },
    imageFileId: {
      type: String,
      default: "",
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const postModel = mongoose.model("post", postSchema);

module.exports = postModel;
