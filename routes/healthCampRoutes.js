const express = require("express");
const router = express.Router();
const healthCampController = require("../controllers/healthCampController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

router.get("/", healthCampController.getAllHealthCamps);
router.get("/:id", healthCampController.getHealthCampById);
router.post("/", verifyToken, verifyPermission("health-camps", "create"), healthCampController.createHealthCamp);
router.put("/:id", verifyToken, verifyPermission("health-camps", "edit"), healthCampController.updateHealthCamp);
router.delete("/:id", verifyToken, verifyPermission("health-camps", "delete"), healthCampController.deleteHealthCamp);

module.exports = router;
