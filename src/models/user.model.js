const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  profilePicture: {
    type: String,
    default:
      "https://imagekit.io/dashboard/media-library/detail/6a4c95b75c7cd75eb800ea3a",
  },
  bio: {
    type: String,
    default: "",
    maxlength: 150,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
