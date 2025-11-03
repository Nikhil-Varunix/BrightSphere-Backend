const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and analytics
 */

// Get overall dashboard stats
router.get(
  "/stats",
  authenticate,
  authorize(["admin", "manager"]),
  (req, res) => {
    // #swagger.tags = ['Dashboard']
    // #swagger.summary = 'Get overall dashboard statistics (counts, downloads, views, etc.)'
    dashboardController.getDashboardStats(req, res);
  }
);

module.exports = router;
