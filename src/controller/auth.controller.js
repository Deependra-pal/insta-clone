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

    res.cookie("token", token);

    // 7. Response
    res.status(201).json({
      success: true,
      message: "User Registered Successfully",

      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
    res.cookie("token", token);

    // 7. Response
    res.status(200).json({
      success: true,
      message: "User login successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  registerController,
  loginController,
};
