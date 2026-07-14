/**
 * File Name: post.controller.js
 * Purpose: Handles request and response logic for post-related operations.
 * Responsibility: Creating posts (uploading images to ImageKit, saving to database), retrieving posts, liking/unliking, and updating/deleting.
 */

const { toFile } = require("@imagekit/nodejs");
const client = require("../config/imageKit.config");
const postModel = require("../models/post.model");
const likeModel = require("../models/like.model");

/**
 * Function Name: createPostController
 * HTTP Method: POST
 * Route: /api/posts
 * Access: Private (Requires JWT Auth)
 * Purpose: Authenticates user, uploads post image to ImageKit, and creates post document in MongoDB.
 */
const createPostController = async (req, res) => {
  try {
    // 1. Validate Request Data (Check if image file exists)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
        data: null,
      });
    }

    // 2. Upload Image to ImageKit
    const file = await client.files.upload({
      file: await toFile(req.file.buffer, req.file.originalname),
      fileName: `${Date.now()}-${req.file.originalname}`,
      folder: "insta-clone-post",
    });

    // 3. Create Post Document in Database using req.userId (attached by authMiddleware)
    const post = await postModel.create({
      caption: req.body.caption || "",
      image: file.url,
      imageFileId: file.fileId,
      owner: req.userId,
    });

    // 4. Send Success Response in standardized format
    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: { post },
    });
  } catch (error) {
    // 5. Handle Errors
    console.error("Error creating post:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      data: null,
    });
  }
};

/**
 * Function Name: getPostController
 * HTTP Method: GET
 * Route: /api/posts
 * Access: Private (Requires JWT Auth)
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
        data: { posts: [] },
      });
    }

    // 4. Send Success Response with Data
    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      data: { posts },
    });
  } catch (err) {
    // 5. Handle Errors
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
      data: null,
    });
  }
};

/**
 * Function Name: getPostDeatilsController
 * HTTP Method: GET
 * Route: /api/posts/:postId
 * Access: Private (Requires JWT Auth)
 * Purpose: Retrieve details of a specific post.
 */
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
        data: null,
      });
    }

    // 5. Check if Logged-in User Owns the Post (Optional authorization check)
    if (!post.owner.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this post",
        data: null,
      });
    }

    // 6. Send Success Response with Post Details
    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      data: { post },
    });
  } catch (error) {
    // 7. Handle Server Errors
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      data: null,
    });
  }
};

/**
 * Function Name: updatePostController
 * HTTP Method: PUT
 * Route: /api/posts/:postId
 * Access: Private (Requires JWT Auth)
 * Purpose: Update post caption.
 */
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
        data: null,
      });
    }

    // 6. Check if Logged-in User Owns the Post
    if (!post.owner.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this post",
        data: null,
      });
    }

    // 7. Update Post Caption
    post.caption = caption || "";

    // 8. Save Updated Post
    await post.save();

    // 9. Send Success Response
    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: { post },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
      data: null,
    });
  }
};

/**
 * Function Name: deletePostController
 * HTTP Method: DELETE
 * Route: /api/posts/:postId
 * Access: Private (Requires JWT Auth)
 * Purpose: Delete a post and its image on ImageKit.
 */
const deletePostController = async (req, res) => {
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
        data: null,
      });
    }

    // 5. Check if Logged-in User Owns the Post
    if (!post.owner.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this post",
        data: null,
      });
    }

    // 6. Delete Image from ImageKit if imageFileId exists
    if (post.imageFileId) {
      try {
        await client.files.delete(post.imageFileId);
      } catch (ikError) {
        console.error("Warning: Failed to delete image from ImageKit:", ikError.message);
      }
    }

    // 7. Delete Post from Database
    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
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

/**
 * Function Name: likeController
 * HTTP Method: POST
 * Route: /api/posts/:postId/like
 * Access: Private (Requires JWT Auth)
 * Purpose: Toggle like status (like/unlike) of a post for the authenticated user.
 */
const likeController = async (req, res) => {
  try {
    // 1. Get Logged-in User ID from auth middleware
    const userId = req.userId;

    // 2. Get Post ID from request params
    const postId = req.params.postId;

    // 3. Find the post by ID (to ensure it exists)
    const post = await postModel.findById(postId);

    // 4. Return 404 if the post does not exist
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
        data: null,
      });
    }

    // 5. Check whether the logged-in user has already liked the post
    const existingLike = await likeModel.findOne({ postId, userId });

    let message = "";

    // 6. Toggle Like state
    if (existingLike) {
      // If already liked, delete the Like document (unlike)
      await likeModel.deleteOne({ _id: existingLike._id });
      message = "Post unliked successfully";
    } else {
      // If not liked, create a new Like document (like)
      await likeModel.create({ postId, userId });
      message = "Post liked successfully";
    }

    // 7. Get the updated total likes count for this post
    const likesCount = await likeModel.countDocuments({ postId });

    // 8. Return success response
    return res.status(200).json({
      success: true,
      message,
      data: {
        postId,
        likesCount,
        isLiked: !existingLike,
      },
    });
  } catch (error) {
    // 9. Handle server errors properly
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      data: null,
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
