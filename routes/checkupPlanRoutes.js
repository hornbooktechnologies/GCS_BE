const express = require("express");
const router = express.Router();
const checkupPlanController = require("../controllers/checkupPlanController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const checkupPlanUpload = require("../middleware/checkupPlanUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), checkupPlanController.getAllCheckupPlans);
router.get("/:id", verifyToken, verifyRole(["admin"]), checkupPlanController.getCheckupPlanById);
router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  checkupPlanUpload.single("image"),
  checkupPlanController.createCheckupPlan,
);
router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  checkupPlanUpload.single("image"),
  checkupPlanController.updateCheckupPlan,
);
router.delete("/:id", verifyToken, verifyRole(["admin"]), checkupPlanController.deleteCheckupPlan);

module.exports = router;
