/**
 * File Name: server.js
 * Purpose: Application entry point to bootstrap and start the Express server.
 * Responsibility: Loads environment variables, connects to the database, and starts the HTTP server.
 */

// Load environment variables from .env file to enable process.env access
require("dotenv").config();

const app = require("./src/app");
const connectToDb = require("./src/config/database");

/**
 * Function Name: startServer
 * HTTP Method: N/A
 * Route: N/A
 * Access: N/A (Server bootstrap)
 * Purpose: Connects to the database and starts the server listener.
 */
const startServer = async () => {
  try {
    // 1. Connect to the Database
    await connectToDb();

    // 2. Start listening on the specified port
    app.listen(5000, () => {
      console.log("server is running on port 5000");
    });
  } catch (error) {
    // 3. Handle Bootstrapping Errors
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

// Start the server execution
startServer();