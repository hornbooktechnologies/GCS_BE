const express = require("express");
const router = express.Router();
const campusLifeController = require("../controllers/campusLifeController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const campusLifeUpload = require("../middleware/campusLifeUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), campusLifeController.getAllCampusLife);
router.get("/:id", verifyToken, verifyRole(["admin"]), campusLifeController.getCampusLifeById);
router.post("/", verifyToken, verifyRole(["admin"]), campusLifeUpload.single("image"), campusLifeController.createCampusLife);
router.put("/:id", verifyToken, verifyRole(["admin"]), campusLifeUpload.single("image"), campusLifeController.updateCampusLife);
router.delete("/:id", verifyToken, verifyRole(["admin"]), campusLifeController.deleteCampusLife);

module.exports = router;
