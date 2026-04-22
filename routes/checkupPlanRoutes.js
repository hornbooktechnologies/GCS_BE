const express = require("express");
const router = express.Router();
const checkupPlanController = require("../controllers/checkupPlanController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const checkupPlanUpload = require("../middleware/checkupPlanUploadMiddleware");

router.get("/", checkupPlanController.getAllCheckupPlans);
router.get("/:id", checkupPlanController.getCheckupPlanById);
router.post(
  "/",
  verifyToken,
  verifyPermission("checkup-plans", "create"),
  checkupPlanUpload.single("image"),
  checkupPlanController.createCheckupPlan,
);
router.put(
  "/:id",
  verifyToken,
  verifyPermission("checkup-plans", "edit"),
  checkupPlanUpload.single("image"),
  checkupPlanController.updateCheckupPlan,
);
router.delete("/:id", verifyToken, verifyPermission("checkup-plans", "delete"), checkupPlanController.deleteCheckupPlan);

module.exports = router;
