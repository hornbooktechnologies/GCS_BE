const express = require("express");
const router = express.Router();
const doctorTestimonialController = require("../controllers/doctorTestimonialController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

router.put(
  "/reorder",
  verifyToken,
  verifyPermission("doctor-testimonials", "edit"),
  doctorTestimonialController.reorderDoctorTestimonials,
);

router.post(
  "/",
  verifyToken,
  verifyPermission("doctor-testimonials", "create"),
  doctorTestimonialController.createDoctorTestimonial,
);

router.get(
  "/",
  doctorTestimonialController.getAllDoctorTestimonials,
);

router.get(
  "/:id",
  doctorTestimonialController.getDoctorTestimonialById,
);

router.put(
  "/:id",
  verifyToken,
  verifyPermission("doctor-testimonials", "edit"),
  doctorTestimonialController.updateDoctorTestimonial,
);

router.delete(
  "/:id",
  verifyToken,
  verifyPermission("doctor-testimonials", "delete"),
  doctorTestimonialController.deleteDoctorTestimonial,
);

module.exports = router;
