const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const eventUpload = require("../middleware/eventUploadMiddleware");

router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  eventUpload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 20 },
  ]),
  eventController.createEvent,
);

router.get("/", verifyToken, verifyRole(["admin"]), eventController.getAllEvents);

router.get("/:id", verifyToken, verifyRole(["admin"]), eventController.getEventById);

router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  eventUpload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 20 },
  ]),
  eventController.updateEvent,
);

router.delete("/:id", verifyToken, verifyRole(["admin"]), eventController.deleteEvent);

module.exports = router;
