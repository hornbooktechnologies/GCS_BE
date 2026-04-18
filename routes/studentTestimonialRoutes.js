const express = require("express");
const router = express.Router();
const studentTestimonialController = require("../controllers/studentTestimonialController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const studentTestimonialUpload = require("../middleware/studentTestimonialUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), studentTestimonialController.getAllStudentTestimonials);
router.get("/:id", verifyToken, verifyRole(["admin"]), studentTestimonialController.getStudentTestimonialById);
router.post("/", verifyToken, verifyRole(["admin"]), studentTestimonialUpload.single("image"), studentTestimonialController.createStudentTestimonial);
router.put("/:id", verifyToken, verifyRole(["admin"]), studentTestimonialUpload.single("image"), studentTestimonialController.updateStudentTestimonial);
router.delete("/:id", verifyToken, verifyRole(["admin"]), studentTestimonialController.deleteStudentTestimonial);

module.exports = router;
