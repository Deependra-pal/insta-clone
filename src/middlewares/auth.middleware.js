const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get Token from Cookie
    const token = req.cookies.token;

    // 2. Check Token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 3. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 4. Store User ID in Request
    req.userId = decoded.id;

    // 5. Next Middleware / Controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

module.exports = authMiddleware;
