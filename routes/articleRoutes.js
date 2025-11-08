// routes/articleRoutes.js
const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const upload = require("../middlewares/upload");

// ------------------ Create Article ------------------
router.post(
  "/",
  authenticate,
  authorize(["admin", "editor"]),
  upload.single("coverImage"),
  (req, res) => {
    // #swagger.tags = ['Articles']
    // #swagger.summary = 'Create a new article'
    // #swagger.security = [{ "bearerAuth": [] }]
    articleController.createArticle(req, res);
  }
);

// ------------------ Get All Articles ------------------
router.get(
  "/",
  (req, res) => {
    // #swagger.tags = ['Articles']
    // #swagger.summary = 'Get all articles with pagination and search'
    // #swagger.security = [{ "bearerAuth": [] }]
    articleController.getArticles(req, res);
  }
);



// Restore Deleted Article
router.put(
  "/restore/:id",
  authenticate,
  authorize(["admin"]),
  articleController.restoreArticle
);

// Get All Deleted Articles
router.get(
  "/deleted",
  authenticate,
  authorize(["admin", "editor"]),
  articleController.getDeletedArticles
);


// ------------------ Increment Download Count ------------------
router.patch(
  "/download/:id",
  (req, res) => {
    // #swagger.tags = ['Articles']
    // #swagger.summary = 'Increment download count by 1 for an article'
    // #swagger.security = [{ "bearerAuth": [] }]
    articleController.incrementDownload(req, res);
  }
);

// Increment view count
router.patch(
  "/view/:id",
  (req, res) => {
    // #swagger.tags = ['Articles']
    // #swagger.summary = 'Increment article view count'
    articleController.incrementViewCount(req, res);
  }
);


// ------------------ Get Article by ID ------------------
router.get(
  "/:id",
  (req, res) => {
    // #swagger.tags = ['Articles']
    // #swagger.summary = 'Get article by ID'
    // #swagger.security = [{ "bearerAuth": [] }]
    articleController.getArticleById(req, res);
  }
);

// ------------------ Update Article by ID ------------------
router.put(
  "/update/:id",
  authenticate,
  authorize(["admin", "editor"]),
  upload.single("coverImage"),
  (req, res) => {
    // #swagger.tags = ['Articles']
    // #swagger.summary = 'Update article by ID'
    // #swagger.security = [{ "bearerAuth": [] }]
    articleController.updateArticle(req, res);
  }
);

// ------------------ Soft Delete Article by ID ------------------
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "editor"]),
  (req, res) => {
    // #swagger.tags = ['Articles']
    // #swagger.summary = 'Soft delete article by ID'
    // #swagger.security = [{ "bearerAuth": [] }]
    articleController.deleteArticle(req, res);
  }
);

module.exports = router;
