const express = require("express");
const router = express.Router();
const careerController = require("../controllers/careerController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const careerUpload = require("../middleware/careerUploadMiddleware");

router.get("/current-openings", careerController.getAllCurrentOpenings);
router.get("/current-openings/:id", careerController.getCurrentOpeningById);
router.post(
  "/current-openings",
  verifyToken,
  verifyPermission("career", "create"),
  careerController.createCurrentOpening,
);
router.put(
  "/current-openings/:id",
  verifyToken,
  verifyPermission("career", "edit"),
  careerController.updateCurrentOpening,
);
router.delete(
  "/current-openings/:id",
  verifyToken,
  verifyPermission("career", "delete"),
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
  verifyPermission("career", "list"),
  careerController.getAllCareerApplications,
);

router.get("/teaching-positions", careerController.getAllTeachingPositions);
router.get("/teaching-positions/:id", careerController.getTeachingPositionById);
router.post(
  "/teaching-positions",
  verifyToken,
  verifyPermission("career", "create"),
  careerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  careerController.createTeachingPosition,
);
router.put(
  "/teaching-positions/:id",
  verifyToken,
  verifyPermission("career", "edit"),
  careerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  careerController.updateTeachingPosition,
);
router.delete(
  "/teaching-positions/:id",
  verifyToken,
  verifyPermission("career", "delete"),
  careerController.deleteTeachingPosition,
);

router.get("/internship-positions", careerController.getAllInternshipPositions);
router.get("/internship-positions/:id", careerController.getInternshipPositionById);
router.post(
  "/internship-positions",
  verifyToken,
  verifyPermission("career", "create"),
  careerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  careerController.createInternshipPosition,
);
router.put(
  "/internship-positions/:id",
  verifyToken,
  verifyPermission("career", "edit"),
  careerUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  careerController.updateInternshipPosition,
);
router.delete(
  "/internship-positions/:id",
  verifyToken,
  verifyPermission("career", "delete"),
  careerController.deleteInternshipPosition,
);

module.exports = router;
