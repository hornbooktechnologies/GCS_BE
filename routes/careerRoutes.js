const express = require("express");
const router = express.Router();
const careerController = require("../controllers/careerController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const careerUpload = require("../middleware/careerUploadMiddleware");

router.get("/current-openings", careerController.getAllCurrentOpenings);
router.get("/current-openings/:id", careerController.getCurrentOpeningById);
router.post(
  "/current-openings",
  verifyToken,
  verifyRole(["admin"]),
  careerController.createCurrentOpening,
);
router.put(
  "/current-openings/:id",
  verifyToken,
  verifyRole(["admin"]),
  careerController.updateCurrentOpening,
);
router.delete(
  "/current-openings/:id",
  verifyToken,
  verifyRole(["admin"]),
  careerController.deleteCurrentOpening,
);

router.post(
  "/applications",
  careerUpload.single("resume"),
  careerController.submitCareerApplication,
);
router.get(
  "/applications",
  verifyToken,
  verifyRole(["admin"]),
  careerController.getAllCareerApplications,
);

router.get("/teaching-positions", careerController.getAllTeachingPositions);
router.get("/teaching-positions/:id", careerController.getTeachingPositionById);
router.post(
  "/teaching-positions",
  verifyToken,
  verifyRole(["admin"]),
  careerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  careerController.createTeachingPosition,
);
router.put(
  "/teaching-positions/:id",
  verifyToken,
  verifyRole(["admin"]),
  careerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  careerController.updateTeachingPosition,
);
router.delete(
  "/teaching-positions/:id",
  verifyToken,
  verifyRole(["admin"]),
  careerController.deleteTeachingPosition,
);

router.get("/internship-positions", careerController.getAllInternshipPositions);
router.get("/internship-positions/:id", careerController.getInternshipPositionById);
router.post(
  "/internship-positions",
  verifyToken,
  verifyRole(["admin"]),
  careerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  careerController.createInternshipPosition,
);
router.put(
  "/internship-positions/:id",
  verifyToken,
  verifyRole(["admin"]),
  careerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  careerController.updateInternshipPosition,
);
router.delete(
  "/internship-positions/:id",
  verifyToken,
  verifyRole(["admin"]),
  careerController.deleteInternshipPosition,
);

module.exports = router;
