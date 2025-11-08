const express = require("express");
const router = express.Router();
const inpressController = require("../controllers/inpressArticleController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const upload = require("../middlewares/upload");

// ------------------ Create In-Press Article ------------------
router.post(
  "/",
  authenticate,
  authorize(["admin", "editor"]),
  upload.fields([
    { name: "document", maxCount: 1 }, // ✅ Only document upload now
  ]),
  (req, res) => {
    // #swagger.tags = ['InPress Articles']
    // #swagger.summary = 'Create a new in-press article'
    // #swagger.security = [{ "bearerAuth": [] }]
    inpressController.createInpressArticle(req, res);
  }
);

// ------------------ Get All In-Press Articles ------------------
router.get("/", (req, res) => {
  // #swagger.tags = ['InPress Articles']
  // #swagger.summary = 'Get all in-press articles with pagination and search'
  inpressController.getInpressArticles(req, res);
});

// ------------------ Get In-Press Articles by Journal ID ------------------
router.get("/journal/:journalId", (req, res) => {
  // #swagger.tags = ['InPress Articles']
  // #swagger.summary = 'Get in-press articles by journal ID'
  inpressController.getInpressArticlesByJournal(req, res);
});

// routes/inpressArticleRoutes.js
router.put(
  "/:id",
  authenticate,
  authorize(["admin", "editor"]),
  upload.fields([{ name: "document", maxCount: 1 }]),
  (req, res) => {
    inpressController.updateInpressArticle(req, res);
  }
);


// ------------------ Soft Delete In-Press Article ------------------
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  (req, res) => {
    // #swagger.tags = ['InPress Articles']
    // #swagger.summary = 'Soft delete an in-press article'
    // #swagger.security = [{ "bearerAuth": [] }]
    inpressController.deleteInpressArticle(req, res);
  }
);

module.exports = router;
