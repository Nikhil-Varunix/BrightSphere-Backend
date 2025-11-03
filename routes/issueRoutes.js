const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

// ------------------ Create Issue (admin/manager) ------------------
router.post("/", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Issues']
  // #swagger.summary = 'Create a new issue'
  // #swagger.security = [{ "bearerAuth": [] }]
  issueController.createIssue(req, res);
});

// ------------------ Get All Issues ------------------
router.get("/", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Issues']
  // #swagger.summary = 'Get all issues with pagination and search'
  // #swagger.security = [{ "bearerAuth": [] }]
  issueController.getIssues(req, res);
});

// ------------------ Get Issues by Volume ------------------
router.get("/by-volume/:id", authenticate, (req, res) => {
  // #swagger.tags = ['Issues']
  // #swagger.summary = 'Get all Issues by Volume ID'
  // #swagger.security = [{ "bearerAuth": [] }]
  issueController.getIssuesByVolume(req, res);
});
// router.get(
//   "/by-volume/:id",
//   authenticate,
//   issueController.getIssuesByVolume
// );

// ------------------ Get Issue by ID ------------------
router.get("/:id", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Issues']
  // #swagger.summary = 'Get issue by ID'
  // #swagger.security = [{ "bearerAuth": [] }]
  issueController.getIssueById(req, res);
});

// ------------------ Update Issue by ID ------------------
router.put("/:id", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Issues']
  // #swagger.summary = 'Update issue by ID'
  // #swagger.security = [{ "bearerAuth": [] }]
  issueController.updateIssue(req, res);
});

// ------------------ Soft Delete Issue by ID ------------------
router.delete("/:id", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Issues']
  // #swagger.summary = 'Soft delete issue by ID'
  // #swagger.security = [{ "bearerAuth": [] }]
  issueController.deleteIssue(req, res);
});

module.exports = router;
