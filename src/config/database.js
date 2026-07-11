/**
 * File Name: database.js
 * Purpose: Connection setup and configuration for MongoDB database using Mongoose.
 * Responsibility: Connects the server to the MongoDB database based on the environment configuration.
 *
 * Configuration Requirements:
 * - MONGO_URI: The connection string containing database location, credentials, and settings. Without this, Mongoose cannot reach the MongoDB instance.
 */

const mongoose = require("mongoose");

/**
 * Function Name: connectToDb
 * HTTP Method: N/A
 * Route: N/A
 * Access: Private (Called only during app bootstrapping)
 * Purpose: Establishes a connection to the MongoDB database using the configured URI.
 */
async function connectToDb() {
  // 1. Verify MONGO_URI environment variable existence
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in the .env file");
  }

  try {
    // 2. Connect to MongoDB through mongoose
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");
  } catch (error) {
    // 3. Handle connection failure errors and exit process
    console.log(error.message);
    process.exit(1);
  }
}

module.exports = connectToDb;
