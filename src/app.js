const cors = require("cors");


/**
 * File Name: app.js
 * Purpose: Express application configuration and setup.
 * Responsibility: Configures core middlewares (cookie parsing, body parsing) and mounts main router endpoints.
 */

const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const postRouter = require("./routes/post.routes");
const commentRouter = require("./routes/comment.routes");
const userRouter = require("./routes/user.routes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 1. Configure Global Middlewares
// - express.json(): Required to parse incoming JSON payloads in request bodies.
// - cookieParser(): Required to parse cookies sent in request headers for session authentication.
app.use(express.json());
app.use(cookieParser());

// 2. Mount API Routes
// - /api/auth: Handles user registration, login, logout, and profile retrieval.
// - /api/posts: Handles creating, retrieving, updating, and deleting posts.
// - /api: Handles comments endpoints (/api/posts/:postId/comments, /api/comments/:commentId, etc.)
// - /api/users: Handles user profile and social features (follow/unfollow).
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api", commentRouter);
app.use("/api/users", userRouter);



module.exports = app;
