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
      imageFileId: file.fileId,
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

const getPostDeatilsController = async (req, res) => {
  try {
    // 1. Get Logged-in User ID from Auth Middleware
    const userId = req.userId;

    // 2. Get Post ID from Request Parameters
    const postId = req.params.postId;

    // 3. Find the Post by ID
    const post = await postModel.findById(postId);

    // 4. Check if the Post Exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 5. Check if Logged-in User Owns the Post
    if (!post.owner.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this post",
      });
    }

    // 6. Send Success Response with Post Details
    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      post,
    });
  } catch (error) {
    // 7. Handle Server Errors
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePostController = async (req, res) => {
  try {
    // 1. Get Logged-in User ID from Auth Middleware
    const userId = req.userId;

    // 2. Get Post ID from Request Parameters
    const postId = req.params.postId;

    // 3. Get Updated Caption from Request Body
    const { caption } = req.body;

    // 4. Find the Post by ID
    const post = await postModel.findById(postId);

    // 5. Check if the Post Exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 6. Check if Logged-in User Owns the Post
    if (!post.owner.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this post",
      });
    }

    // 7. Update Post Caption
    post.caption = caption;

    // 8. Save Updated Post
    await post.save();

    // 9. Send Success Response
    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (err) {
    return res.status(500).json({
      sucess: false,
      message: "err.message",
    });
  }
};

const deletePostController = async (req, res) => {
  try {
    // 1. Get Logged-in User ID from Auth Middleware
    const userId = req.userId;

    // 2. Get Post ID from Request Parameters
    const postId = req.params.postId;

    // 4. Find the Post by ID
    const post = await postModel.findById(postId);

    // 5. Check if the Post Exists
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 6. Check if Logged-in User Owns the Post
    if (!post.owner.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this post",
      });
    }

    // 7. Delete Image from ImageKit
    await client.files.delete(post.imageFileId);

    // 8. Delete Post from Database
    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Post delete sucessfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * Function Name: likeController
 * HTTP Method: POST
 * Route: /api/posts/:postId/like
 * Access: Private
 * Purpose: Toggle like status (like/unlike) of a post for the authenticated user.
 */
const likeController = async (req, res) => {
  try {
    // 1. Get Logged-in User ID from auth middleware
    const userId = req.userId;

    // 2. Get Post ID from request params
    const postId = req.params.postId;

    // 3. Find the post by ID
    const post = await postModel.findById(postId);

    // 4. Return 404 if the post does not exist
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 5. Check whether the logged-in user has already liked the post
    const alreadyLiked = post.likes.some((id) => id.equals(userId));

    let message = "";

    // 6. If already liked: Remove the user's ObjectId from the likes array
    if (alreadyLiked) {
      post.likes.pull(userId);
      // Set message to "Post unliked successfully"
      message = "Post unliked successfully";
    } else {
      // 7. If not liked: Push the user's ObjectId into the likes array
      post.likes.push(userId);
      // Set message to "Post liked successfully"
      message = "Post liked successfully";
    }

    // 8. Save the updated post
    await post.save();

    // 9. Return success response with updated post
    return res.status(200).json({
      success: true,
      message,
      post,
    });
  } catch (error) {
    // 10. Handle server errors properly
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPostController,
  getPostController,
  getPostDeatilsController,
  updatePostController,
  deletePostController,
  likeController,
};
