const express = require("express");
const router = express.Router();
const patientTestimonialController = require("../controllers/patientTestimonialController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.put(
  "/reorder",
  verifyToken,
  verifyRole(["admin"]),
  patientTestimonialController.reorderPatientTestimonials,
);

router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  patientTestimonialController.createPatientTestimonial,
);

router.get(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  patientTestimonialController.getAllPatientTestimonials,
);

router.get(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  patientTestimonialController.getPatientTestimonialById,
);

router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  patientTestimonialController.updatePatientTestimonial,
);

router.delete(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  patientTestimonialController.deletePatientTestimonial,
);

module.exports = router;
