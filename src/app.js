/**
 * File Name: app.js
 * Purpose: Express application configuration and setup.
 * Responsibility: Configures core middlewares (cookie parsing, body parsing) and mounts main router endpoints.
 */

// 1. Import Core Node Modules
const path = require("path");

// 2. Import Third-Party Packages
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// 3. Import Application Routes
const authRouter = require("./routes/auth.routes");
const postRouter = require("./routes/post.routes");
const commentRouter = require("./routes/comment.routes");
const userRouter = require("./routes/user.routes");

// 4. Instantiate Express App
const app = express();

// 5. Configure Global Middlewares
// - cors(): Enable Cross-Origin Resource Sharing with credentials support.
// - express.json(): Parse incoming JSON payloads in request bodies.
// - cookieParser(): Parse cookies sent in request headers for session authentication.
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 6. Mount API Routes (must be mounted before serving static files & wildcard route)
// - /api/auth: Handles user registration, login, logout, and profile retrieval.
// - /api/posts: Handles creating, retrieving, updating, and deleting posts.
// - /api/users: Handles user profile and social features (follow/unfollow).
// - /api: Handles comments endpoints (/api/posts/:postId/comments, /api/comments/:commentId, etc.)
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);
app.use("/api", commentRouter);

// 7. Express Static Configuration for the 'dist' folder
// Serve the compiled static assets from the Frontend/dist directory.
// __dirname is backend/src, so we go up two levels to the root and then into Frontend/dist.
app.use(express.static(path.join(__dirname, "../../Frontend/dist")));

// 8. SPA Fallback (index.html) Configuration
// For any other GET request that does not match an API route or static file,
// serve index.html to support client-side routing in the Single Page Application.
// Note: In Express 5, wildcards must be named (e.g. '*splat').
app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/dist/index.html"));
});

module.exports = app;
