const express = require("express");
const router = express.Router();
const editorController = require("../controllers/editorController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const upload = require("../middlewares/upload");

// ------------------ Create Editor (admin/manager) ------------------
router.post(
  "/",
  authenticate,
  authorize(["admin", "manager"]),
  upload.single("coverImage"),
  (req, res) => {
    // #swagger.tags = ['Editors']
    // #swagger.summary = 'Create a new editor'
    // #swagger.security = [{ "bearerAuth": [] }]
    editorController.createEditor(req, res);
  }
);

// ------------------ Get All Editors (paginated) ------------------
router.get(
  "/",
  authenticate,
  authorize(["admin", "manager"]),
  (req, res) => {
    // #swagger.tags = ['Editors']
    // #swagger.summary = 'Get all editors (paginated)'
    // #swagger.security = [{ "bearerAuth": [] }]
    editorController.getEditors(req, res);
  }
);

// ------------------ Get All Editors (v2, no pagination) ------------------
router.get(
  "/all",
  authenticate,
  authorize(["admin", "manager"]),
  (req, res) => {
    // #swagger.tags = ['Editors']
    // #swagger.summary = 'Get all editors (no pagination)'
    // #swagger.security = [{ "bearerAuth": [] }]
    editorController.getAllEditors(req, res);
  }
);

// ------------------ Get Editor by ID ------------------
router.get(
  "/:id",
  authenticate,
  authorize(["admin", "manager"]),
  (req, res) => {
    // #swagger.tags = ['Editors']
    // #swagger.summary = 'Get editor by ID'
    // #swagger.security = [{ "bearerAuth": [] }]
    editorController.getEditorById(req, res);
  }
);

// ------------------ Update Editor by ID ------------------
router.put(
  "/update/:id",
  authenticate,
  authorize(["admin", "manager"]),
  upload.single("coverImage"),
  (req, res) => {
    // #swagger.tags = ['Editors']
    // #swagger.summary = 'Update editor by ID'
    // #swagger.security = [{ "bearerAuth": [] }]
    editorController.updateEditor(req, res);
  }
);

// ------------------ Delete Editor by ID ------------------
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "manager"]),
  (req, res) => {
    // #swagger.tags = ['Editors']
    // #swagger.summary = 'Soft delete editor by ID'
    // #swagger.security = [{ "bearerAuth": [] }]
    editorController.deleteEditor(req, res);
  }
);

module.exports = router;
