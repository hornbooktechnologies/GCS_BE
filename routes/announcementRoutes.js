const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const announcementUpload = require("../middleware/announcementUploadMiddleware");

router.put(
  "/reorder",
  verifyToken,
  verifyRole(["admin"]),
  announcementController.reorderAnnouncements,
);

router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  announcementUpload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  announcementController.createAnnouncement,
);

router.get(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  announcementController.getAllAnnouncements,
);

router.get(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  announcementController.getAnnouncementById,
);

router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  announcementUpload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  announcementController.updateAnnouncement,
);

router.delete(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  announcementController.deleteAnnouncement,
);

module.exports = router;
