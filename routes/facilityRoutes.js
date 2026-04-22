const express = require("express");
const router = express.Router();
const facilityController = require("../controllers/facilityController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const facilityUpload = require("../middleware/facilityUploadMiddleware");

router.get("/", facilityController.getAllFacilities);
router.get("/:id", facilityController.getFacilityById);
router.post("/", verifyToken, verifyPermission("facilities", "create"), facilityUpload.single("image"), facilityController.createFacility);
router.put("/:id", verifyToken, verifyPermission("facilities", "edit"), facilityUpload.single("image"), facilityController.updateFacility);
router.delete("/:id", verifyToken, verifyPermission("facilities", "delete"), facilityController.deleteFacility);

module.exports = router;
