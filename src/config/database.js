const mongoose = require("mongoose");

async function connectToDb() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in the .env file");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}

module.exports = connectToDb;
