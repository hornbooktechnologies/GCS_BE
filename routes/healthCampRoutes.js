const express = require("express");
const router = express.Router();
const healthCampController = require("../controllers/healthCampController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), healthCampController.getAllHealthCamps);
router.get("/:id", verifyToken, verifyRole(["admin"]), healthCampController.getHealthCampById);
router.post("/", verifyToken, verifyRole(["admin"]), healthCampController.createHealthCamp);
router.put("/:id", verifyToken, verifyRole(["admin"]), healthCampController.updateHealthCamp);
router.delete("/:id", verifyToken, verifyRole(["admin"]), healthCampController.deleteHealthCamp);

module.exports = router;
