const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

// Get dashboard statistics
router.get("/", verifyToken, verifyPermission("dashboard", "list"), dashboardController.getDashboardStats);

module.exports = router;
