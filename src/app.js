/**
 * File Name: app.js
 * Purpose: Express application configuration and setup.
 * Responsibility: Configures core middlewares (cookie parsing, body parsing) and mounts main router endpoints.
 */

const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const postRouter = require("./routes/post.routes");

const app = express();

// 1. Configure Global Middlewares
// - express.json(): Required to parse incoming JSON payloads in request bodies.
// - cookieParser(): Required to parse cookies sent in request headers for session authentication.
app.use(express.json());
app.use(cookieParser());

// 2. Mount API Routes
// - /api/auth: Handles user registration, login, logout, and profile retrieval.
// - /api/post: Handles creating and retrieving user posts.
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);

module.exports = app;
