const express = require("express");
const router = express.Router();
const doctorTestimonialController = require("../controllers/doctorTestimonialController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.put(
  "/reorder",
  verifyToken,
  verifyRole(["admin"]),
  doctorTestimonialController.reorderDoctorTestimonials,
);

router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  doctorTestimonialController.createDoctorTestimonial,
);

router.get(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  doctorTestimonialController.getAllDoctorTestimonials,
);

router.get(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  doctorTestimonialController.getDoctorTestimonialById,
);

router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  doctorTestimonialController.updateDoctorTestimonial,
);

router.delete(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  doctorTestimonialController.deleteDoctorTestimonial,
);

module.exports = router;
