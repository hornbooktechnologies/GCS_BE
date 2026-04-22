const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const eventUpload = require("../middleware/eventUploadMiddleware");

router.post(
  "/",
  verifyToken,
  verifyPermission("events", "create"),
  eventUpload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 20 },
  ]),
  eventController.createEvent,
);

router.get("/", eventController.getAllEvents);

router.get("/:id", eventController.getEventById);

router.put(
  "/:id",
  verifyToken,
  verifyPermission("events", "edit"),
  eventUpload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 20 },
  ]),
  eventController.updateEvent,
);

router.delete("/:id", verifyToken, verifyPermission("events", "delete"), eventController.deleteEvent);

module.exports = router;
