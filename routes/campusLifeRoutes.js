const express = require("express");
const router = express.Router();
const campusLifeController = require("../controllers/campusLifeController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const campusLifeUpload = require("../middleware/campusLifeUploadMiddleware");

router.get("/", campusLifeController.getAllCampusLife);
router.get("/:id", campusLifeController.getCampusLifeById);
router.post("/", verifyToken, verifyPermission("campus-life", "create"), campusLifeUpload.single("image"), campusLifeController.createCampusLife);
router.put("/:id", verifyToken, verifyPermission("campus-life", "edit"), campusLifeUpload.single("image"), campusLifeController.updateCampusLife);
router.delete("/:id", verifyToken, verifyPermission("campus-life", "delete"), campusLifeController.deleteCampusLife);

module.exports = router;
