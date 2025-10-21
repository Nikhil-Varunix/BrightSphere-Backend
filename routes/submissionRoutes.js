
const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const upload = require("../middlewares/upload");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

// ------------------ Create Submission ------------------
router.post(
  "/create",
  upload.array("files", 10), // allow multiple uploads
  (req, res) => {
    // #swagger.tags = ['Submissions']
    // #swagger.summary = 'Create a new submission'
    submissionController.createSubmission(req, res);
  }
);

// ------------------ Get All Submissions ------------------
router.get(
  "/all",
  authenticate,
  authorize(['admin', 'editor']), // enable when admin-only
  (req, res) => {
    // #swagger.tags = ['Submissions']
    // #swagger.summary = 'Get all submissions'
    submissionController.getAllSubmissions(req, res);
  }
);

// ------------------ Get Submission by ID ------------------
router.get(
  "/:id",
  (req, res) => {
    // #swagger.tags = ['Submissions']
    // #swagger.summary = 'Get submission by ID'
    submissionController.getSubmissionById(req, res);
  }
);

// ------------------ Update Submission Status ------------------
router.patch(
  "/:id/status",
  authenticate,
  authorize(['admin', 'editor']), // enable when admin-only
  (req, res) => {
    // #swagger.tags = ['Submissions']
    // #swagger.summary = 'Update submission status'
    // #swagger.security = [{ "bearerAuth": [] }]
    submissionController.updateSubmissionStatus(req, res);
  }
);

router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "editor"]),
  (req, res) => {
    // #swagger.tags = ['Submissions']
    // #swagger.summary = 'Soft delete a submission'
    // #swagger.security = [{ "bearerAuth": [] }]
    submissionController.deleteSubmission(req, res);
  }
);


module.exports = router;
