/**
 * File Name: auth.middleware.js
 * Purpose: Authentication middleware for route protection using JWT.
 * Responsibility: Verify token from cookies or Authorization header, decode user details, and attach them to the request object.
 */

const jwt = require("jsonwebtoken");

/**
 * Middleware Explanation:
 * - Why it exists: To restrict access to protected API endpoints to authenticated users only.
 * - What it checks: Checks if a valid JWT token exists in req.cookies or the Authorization header as a Bearer token.
 * - What happens if validation/authentication fails: Responds with a 401 Unauthorized status and a failure message.
 * - Why next() is called: To proceed to the target controller/middleware when the request has a valid session/token.
 */

/**
 * Function Name: authMiddleware
 * HTTP Method: N/A (Middleware)
 * Route: N/A
 * Access: Public (Used to guard private routes)
 * Purpose: Verify the JWT from the client and attach the user ID to req.userId if authentic.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get Token from Cookie or Authorization Header
    let token = req.cookies.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Validate Token Presence
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token missing",
      });
    }

    // 3. Verify Token using Secret Key
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 4. Store Decoded User ID in Request Object
    req.userId = decoded.id;

    // 5. Invoke next() to pass execution to the next handler
    next();
  } catch (error) {
    // 6. Handle Invalid or Expired Token Errors
    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

module.exports = authMiddleware;

