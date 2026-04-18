const express = require("express");
const router = express.Router();
const facilityController = require("../controllers/facilityController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const facilityUpload = require("../middleware/facilityUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), facilityController.getAllFacilities);
router.get("/:id", verifyToken, verifyRole(["admin"]), facilityController.getFacilityById);
router.post("/", verifyToken, verifyRole(["admin"]), facilityUpload.single("image"), facilityController.createFacility);
router.put("/:id", verifyToken, verifyRole(["admin"]), facilityUpload.single("image"), facilityController.updateFacility);
router.delete("/:id", verifyToken, verifyRole(["admin"]), facilityController.deleteFacility);

module.exports = router;
