const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const doctorUpload = require("../middleware/doctorUploadMiddleware");

router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.post("/", verifyToken, verifyPermission("doctors", "create"), doctorUpload.single("image"), doctorController.createDoctor);
router.put("/:id", verifyToken, verifyPermission("doctors", "edit"), doctorUpload.single("image"), doctorController.updateDoctor);
router.delete("/:id", verifyToken, verifyPermission("doctors", "delete"), doctorController.deleteDoctor);

module.exports = router;
