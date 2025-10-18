// utils\getRelativePath.js

const path = require("path");

const getRelativePath = (filePath) => {
  // Normalize path to use forward slashes (cross-platform)
  const normalizedPath = filePath.split(path.sep).join("/");

  // Find the "uploads" folder in the path
  const uploadsIndex = normalizedPath.indexOf("/uploads");
  if (uploadsIndex === -1) return ""; // fallback if uploads not found

  // Return path starting from /uploads
  return normalizedPath.substring(uploadsIndex);
};

module.exports = getRelativePath;