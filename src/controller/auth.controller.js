const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerController = async (req, res) => {
  try {
    // 1. req.body se data lena
    const { username, email, password } = req.body;

    // 3. Check if email or username already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create User
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    // 6. Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookie in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Strip password from the response
    const userObj = user.toObject();
    delete userObj.password;

    // 7. Response
    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      data: { user: userObj },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      data: null,
    });
  }
};

const loginController = async (req, res) => {
  try {
    // 1. Get Data
    const { username, email, password } = req.body;

    // 2. Find User
    const user = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    // 3. User Not Found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 5. Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // 6. Store Token in Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 7. Response
    res.status(200).json({
      success: true,
      message: "User login successfully",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      data: null,
    });
  }
};

const getMeController = async (req, res) => {
  try {
    // 1. Get User ID from Middleware
    const userId = req.userId;

    // 2. Find User
    const user = await userModel.findById(userId).select("username email bio profilePicture");

    // 3. User Not Found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // 4. Response
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: {
        user: {
          username: user.username,
          email: user.email,
          bio: user.bio,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      data: null,
    });
  }
};

const logoutController = async (req, res) => {
  try {
    // Clear Cookie
    res.clearCookie("token");

    // Response
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
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
  registerController,
  loginController,
  getMeController,
  logoutController,
};
