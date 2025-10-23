const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journalController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const upload = require("../middlewares/upload");


// ------------------ Create Journal (admin/manager/editor) ------------------
router.post("/", authenticate, authorize(["admin", "manager", "editor"]), upload.single("coverImage"), (req, res) => {
    // #swagger.tags = ['Journals']
    // #swagger.summary = 'Create a new journal'
    // #swagger.security = [{ "bearerAuth": [] }]
    journalController.createJournal(req, res);
});

// ------------------ Get All Journals ------------------
router.get("/", (req, res) => {
    // #swagger.tags = ['Journals']
    // #swagger.summary = 'Get all journals'
    // #swagger.security = [{ "bearerAuth": [] }]
    journalController.getJournals(req, res);
});

// ------------------ Get All Journals (no pagination) ------------------
// router.get("/all", authenticate, authorize(["admin", "manager"]), (req, res) => {
router.get("/all", (req, res) => {
    // #swagger.tags = ['Journals']
    // #swagger.summary = 'Get all journals without pagination'
    // #swagger.security = [{ "bearerAuth": [] }]
    journalController.getAllJournals(req, res);
});

// ------------------ Get All Journals (deleted) ------------------
router.get("/all/deleted", (req, res) => {
    // #swagger.tags = ['Journals']
    // #swagger.summary = 'Get all journals without pagination'
    // #swagger.security = [{ "bearerAuth": [] }]
    journalController.getAllDeletedJournals(req, res);
});

// ------------------ Get Journal by ID ------------------
router.get("/:id", (req, res) => {
    // #swagger.tags = ['Journals']
    // #swagger.summary = 'Get journal by ID'
    // #swagger.security = [{ "bearerAuth": [] }]
    journalController.getJournalById(req, res);
});

router.get("/v2/:id", (req, res) => {
    // #swagger.tags = ['Journals']
    // #swagger.summary = 'Get journal by ID v2 full details'
    // #swagger.security = [{ "bearerAuth": [] }]
    journalController.getJournalFullDetails(req, res);
});

// ------------------ Update Journal by ID ------------------
router.put("/update/:id", authenticate, authorize(["admin", "manager", "editor"]), (req, res) => {
    // #swagger.tags = ['Journals']
    // #swagger.summary = 'Update journal by ID'
    // #swagger.security = [{ "bearerAuth": [] }]
    journalController.updateJournal(req, res);
});

// ------------------ Update Journal Image ------------------
router.put(
  "/update/image/:id",
  authenticate,
  authorize(["admin", "manager", "editor"]),
  upload.single("coverImage"),
  (req, res) => {
    // #swagger.tags = ['Journals']
    // #swagger.summary = 'Update journal cover image'
    // #swagger.security = [{ "bearerAuth": [] }]
    journalController.updateJournalImage(req, res);
  }
);

// ------------------ Delete Journal by ID ------------------
router.delete("/:id", authenticate, authorize(["admin", "manager"]), (req, res) => {
    // #swagger.tags = ['Journals']
    // #swagger.summary = 'Delete journal by ID (soft delete)'
    // #swagger.security = [{ "bearerAuth": [] }]
    journalController.deleteJournal(req, res);
});

// ------------------ Restore Journal by ID ------------------
router.put(
  "/restore/:id",
  authenticate,
  authorize(["admin", "manager"]),
  (req, res) => {
    // #swagger.tags = ['Journals']
    // #swagger.summary = 'Restore a soft-deleted journal by ID'
    // #swagger.security = [{ "bearerAuth": [] }]
    journalController.restoreJournal(req, res);
  }
);

module.exports = router;
