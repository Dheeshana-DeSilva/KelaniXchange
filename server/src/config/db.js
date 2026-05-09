
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (error.reason) {
      console.error("Reason details:", JSON.stringify(error.reason, null, 2));
    }
    process.exit(1);
  }
};

module.exports = connectDB;
