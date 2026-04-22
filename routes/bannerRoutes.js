const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const bannerUpload = require("../middleware/bannerUploadMiddleware");

// Reorder banners (must be before /:id routes to avoid conflict)
router.put(
  "/reorder",
  verifyToken,
  verifyPermission("banners", "edit"),
  bannerController.reorderBanners
);

// Create a new banner (with image upload)
router.post(
  "/",
  verifyToken,
  verifyPermission("banners", "create"),
  bannerUpload.single("image"),
  bannerController.createBanner
);

// Get all banners
router.get("/", bannerController.getAllBanners);

// Get banner by ID
router.get("/:id", bannerController.getBannerById);

// Update a banner (with optional image upload)
router.put(
  "/:id",
  verifyToken,
  verifyPermission("banners", "edit"),
  bannerUpload.single("image"),
  bannerController.updateBanner
);

// Delete a banner
router.delete(
  "/:id",
  verifyToken,
  verifyPermission("banners", "delete"),
  bannerController.deleteBanner
);

module.exports = router;
