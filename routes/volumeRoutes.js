const express = require("express");
const router = express.Router();
const volumeController = require("../controllers/volumeController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

// ------------------ Create Volume (admin/manager) ------------------
router.post("/", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Volumes']
  // #swagger.summary = 'Create a new volume'
  // #swagger.security = [{ "bearerAuth": [] }]
  volumeController.createVolume(req, res);
});

// ------------------ Get All Volumes ------------------
router.get("/", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Volumes']
  // #swagger.summary = 'Get all volumes (with pagination and search)'
  // #swagger.security = [{ "bearerAuth": [] }]
  volumeController.getVolumes(req, res);
});

// ------------------ Get Volumes by Journal ------------------
router.get("/by-journal/:id", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Volumes']
  // #swagger.summary = 'Get all volumes by journal ID'
  // #swagger.security = [{ "bearerAuth": [] }]
  volumeController.getVolumesByJournal(req, res);
});

// ------------------ Get Volume by ID ------------------
router.get("/:id", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Volumes']
  // #swagger.summary = 'Get a volume by ID'
  // #swagger.security = [{ "bearerAuth": [] }]
  volumeController.getVolumeById(req, res);
});

// ------------------ Update Volume by ID ------------------
router.put("/:id", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Volumes']
  // #swagger.summary = 'Update a volume by ID'
  // #swagger.security = [{ "bearerAuth": [] }]
  volumeController.updateVolume(req, res);
});

// ------------------ Delete Volume by ID (Soft Delete) ------------------
router.delete("/:id", authenticate, authorize(["admin", "manager"]), (req, res) => {
  // #swagger.tags = ['Volumes']
  // #swagger.summary = 'Soft delete a volume by ID'
  // #swagger.security = [{ "bearerAuth": [] }]
  volumeController.deleteVolume(req, res);
});

module.exports = router;
