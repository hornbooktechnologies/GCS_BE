const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLogController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

router.get(
  "/",
  verifyToken,
  verifyPermission("activity-logs", "list"),
  activityLogController.getActivityLogs,
);

router.delete(
  "/",
  verifyToken,
  verifyPermission("activity-logs", "delete"),
  activityLogController.deleteLogs,
);

router.delete(
  "/:id",
  verifyToken,
  verifyPermission("activity-logs", "delete"),
  activityLogController.deleteLogs,
);

router.post(
  "/delete-multiple",
  verifyToken,
  verifyPermission("activity-logs", "delete"),
  activityLogController.deleteLogs,
);

module.exports = router;
