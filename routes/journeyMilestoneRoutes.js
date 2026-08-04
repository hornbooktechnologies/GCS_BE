const express = require("express");
const journeyMilestoneController = require("../controllers/journeyMilestoneController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", journeyMilestoneController.getPublicJourneyMilestones);
router.get(
  "/admin/all",
  verifyToken,
  verifyPermission("journey-milestones", "list"),
  journeyMilestoneController.getAdminJourneyMilestones,
);
router.get(
  "/:id",
  verifyToken,
  verifyPermission("journey-milestones", "list"),
  journeyMilestoneController.getJourneyMilestoneById,
);
router.post(
  "/",
  verifyToken,
  verifyPermission("journey-milestones", "create"),
  journeyMilestoneController.createJourneyMilestone,
);
router.put(
  "/reorder",
  verifyToken,
  verifyPermission("journey-milestones", "edit"),
  journeyMilestoneController.reorderJourneyMilestones,
);
router.put(
  "/:id",
  verifyToken,
  verifyPermission("journey-milestones", "edit"),
  journeyMilestoneController.updateJourneyMilestone,
);
router.delete(
  "/:id",
  verifyToken,
  verifyPermission("journey-milestones", "delete"),
  journeyMilestoneController.deleteJourneyMilestone,
);

module.exports = router;
