const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb://${encodeURIComponent(process.env.DB_USER_NAME)}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.MONGO_URI}/${process.env.DB_NAME}?authSource=admin`
      
    );

    console.log("✅ MongoDB Connected...");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
