// app.js
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");
const cors = require("cors");
const path = require("path");


// Route imports
const userRoutes = require("./routes/userRoutes");
const editorRoutes = require("./routes/editorRoutes");
const volumeRoutes = require("./routes/volumeRoutes");
const issueRoutes = require("./routes/issueRoutes");
const journalRoutes = require("./routes/journalRoutes");
const articleRoutes = require("./routes/articleRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // ✅ Allow all origins and handle preflight
app.set('trust proxy', true);


// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/editors", editorRoutes);
app.use("/api/volumes", volumeRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/dashboard", dashboardRoutes);


// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * Handle unknown routes (404)
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found`,
  });
});

/* Global Error Handler */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
