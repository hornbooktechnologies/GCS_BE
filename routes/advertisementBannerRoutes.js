const express = require("express");
const router = express.Router();
const advertisementBannerController = require("../controllers/advertisementBannerController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const advertisementBannerUpload = require("../middleware/advertisementBannerUploadMiddleware");

router.get(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  advertisementBannerController.getAdvertisementBanner,
);

router.put(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  advertisementBannerUpload.single("image"),
  advertisementBannerController.upsertAdvertisementBanner,
);

module.exports = router;
