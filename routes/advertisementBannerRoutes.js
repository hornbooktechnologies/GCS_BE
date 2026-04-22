const express = require("express");
const router = express.Router();
const advertisementBannerController = require("../controllers/advertisementBannerController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const advertisementBannerUpload = require("../middleware/advertisementBannerUploadMiddleware");

router.get(
  "/",
  advertisementBannerController.getAdvertisementBanner,
);

router.put(
  "/",
  verifyToken,
  verifyPermission("advertisement-banner", "edit"),
  advertisementBannerUpload.single("image"),
  advertisementBannerController.upsertAdvertisementBanner,
);

module.exports = router;
