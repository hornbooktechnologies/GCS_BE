const express = require("express");
const router = express.Router();
const patientTestimonialController = require("../controllers/patientTestimonialController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

router.put(
  "/reorder",
  verifyToken,
  verifyPermission("patient-testimonials", "edit"),
  patientTestimonialController.reorderPatientTestimonials,
);

router.post(
  "/",
  verifyToken,
  verifyPermission("patient-testimonials", "create"),
  patientTestimonialController.createPatientTestimonial,
);

router.get(
  "/",
  patientTestimonialController.getAllPatientTestimonials,
);

router.get(
  "/:id",
  patientTestimonialController.getPatientTestimonialById,
);

router.put(
  "/:id",
  verifyToken,
  verifyPermission("patient-testimonials", "edit"),
  patientTestimonialController.updatePatientTestimonial,
);

router.delete(
  "/:id",
  verifyToken,
  verifyPermission("patient-testimonials", "delete"),
  patientTestimonialController.deletePatientTestimonial,
);

module.exports = router;
