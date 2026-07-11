/**
 * File Name: post.controller.js
 * Purpose: Handles request and response logic for post-related operations.
 * Responsibility: Creating posts (uploading images to ImageKit, saving to database) and retrieving posts.
 */

const { toFile } = require("@imagekit/nodejs");
const client = require("../config/imageKit.config");
const postModel = require("../models/post.model");
const jwt = require("jsonwebtoken");

/**
 * Function Name: createPostController
 * HTTP Method: POST
 * Route: /api/v1/posts/create
 * Access: Private
 * Purpose: Authenticates user, uploads post image to ImageKit, and creates post document in MongoDB.
 */
const createPostController = async (req, res) => {
  try {
    // 1. Validate Request Data (Check if image file exists)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    // 2. Retrieve Token from Cookies
    const token = req.cookies.token;

    // 3. Validate Token Presence
    if (!token) {
      return res.status(401).json({
        sucess: false,
        message: "Token not provider , Unathorized access",
      });
    }

    let decoded = null;

    // 4. Verify and Decode User Token
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        sucesss: false,
        message: "Unathorized access",
      });
    }

    // 5. Upload Image to ImageKit
    const file = await client.files.upload({
      file: await toFile(req.file.buffer, req.file.originalname),
      fileName: `${Date.now()}-${req.file.originalname}`,
      folder: "insta-clone-post",
    });

    // 6. Create Post Document in Database
    const post = await postModel.create({
      caption: req.body.caption,
      image: file.url,
      owner: decoded.id,
    });

    // 7. Send Success Response
    res.status(201).json({
      sucesss: true,
      message: "Post create sucessfully,",
      post,
    });
  } catch (error) {
    // 8. Handle Errors
    console.error("Error creating post:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Function Name: getPostController
 * HTTP Method: GET
 * Route: /api/v1/posts/get-posts
 * Access: Private
 * Purpose: Fetch all post documents created by the authenticated user.
 */
const getPostController = async (req, res) => {
  try {
    // 1. Retrieve Logged-in User ID from Request (populated by authMiddleware)
    const userId = req.userId;

    // 2. Fetch User Posts from the Database
    const posts = await postModel.find({
      owner: userId,
    });

    // 3. Check if User Has Any Posts
    if (posts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No posts found",
        posts: [],
      });
    }

    // 3. Send Success Response with Data
    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts,
    });
  } catch (err) {
    // 4. Handle Errors
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createPostController,
  getPostController,
};
