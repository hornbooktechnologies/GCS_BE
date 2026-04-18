const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLogController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.get(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  activityLogController.getActivityLogs,
);

router.delete(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  activityLogController.deleteLogs,
);

router.delete(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  activityLogController.deleteLogs,
);

router.post(
  "/delete-multiple",
  verifyToken,
  verifyRole(["admin"]),
  activityLogController.deleteLogs,
);

module.exports = router;
