const express = require("express");
const router = express.Router();
const studentTestimonialController = require("../controllers/studentTestimonialController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const studentTestimonialUpload = require("../middleware/studentTestimonialUploadMiddleware");

router.get("/", studentTestimonialController.getAllStudentTestimonials);
router.get("/:id", studentTestimonialController.getStudentTestimonialById);
router.post("/", verifyToken, verifyPermission("student-testimonials", "create"), studentTestimonialUpload.single("image"), studentTestimonialController.createStudentTestimonial);
router.put("/:id", verifyToken, verifyPermission("student-testimonials", "edit"), studentTestimonialUpload.single("image"), studentTestimonialController.updateStudentTestimonial);
router.delete("/:id", verifyToken, verifyPermission("student-testimonials", "delete"), studentTestimonialController.deleteStudentTestimonial);

module.exports = router;
