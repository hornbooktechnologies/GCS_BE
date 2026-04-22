const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const announcementUpload = require("../middleware/announcementUploadMiddleware");

router.put(
  "/reorder",
  verifyToken,
  verifyPermission("announcements", "edit"),
  announcementController.reorderAnnouncements,
);

router.post(
  "/",
  verifyToken,
  verifyPermission("announcements", "create"),
  announcementUpload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  announcementController.createAnnouncement,
);

router.get(
  "/",
  announcementController.getAllAnnouncements,
);

router.get(
  "/:id",
  announcementController.getAnnouncementById,
);

router.put(
  "/:id",
  verifyToken,
  verifyPermission("announcements", "edit"),
  announcementUpload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  announcementController.updateAnnouncement,
);

router.delete(
  "/:id",
  verifyToken,
  verifyPermission("announcements", "delete"),
  announcementController.deleteAnnouncement,
);

module.exports = router;
