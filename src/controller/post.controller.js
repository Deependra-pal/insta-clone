const { toFile } = require("@imagekit/nodejs");
const client = require("../config/imageKit.config");
const postModel = require("../models/post.model");
const jwt = require("jsonwebtoken");

const createPostController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        sucess: false,
        message: "Token not provider , Unathorized access",
      });
    }

    let decoded = null;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        sucesss: false,
        message: "Unathorized access",
      });
    }

    // // Upload to ImageKit
    const file = await client.files.upload({
      file: await toFile(req.file.buffer, req.file.originalname),
      fileName: `${Date.now()}-${req.file.originalname}`,
      folder: "insta-clone-post",
    });

    const post = await postModel.create({
      caption: req.body.caption,
      image: file.url,
      owner: decoded.id,
    });

    res.status(201).json({
      sucesss: true,
      message: "Post create sucessfully,",
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPostController,
};
