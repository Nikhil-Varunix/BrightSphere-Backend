// server.js
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 8001;

const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📖 Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

startServer();
