const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const doctorUpload = require("../middleware/doctorUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), doctorController.getAllDoctors);
router.get("/:id", verifyToken, verifyRole(["admin"]), doctorController.getDoctorById);
router.post("/", verifyToken, verifyRole(["admin"]), doctorUpload.single("image"), doctorController.createDoctor);
router.put("/:id", verifyToken, verifyRole(["admin"]), doctorUpload.single("image"), doctorController.updateDoctor);
router.delete("/:id", verifyToken, verifyRole(["admin"]), doctorController.deleteDoctor);

module.exports = router;
