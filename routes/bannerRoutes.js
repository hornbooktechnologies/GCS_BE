const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const bannerUpload = require("../middleware/bannerUploadMiddleware");

// Reorder banners (must be before /:id routes to avoid conflict)
router.put(
  "/reorder",
  verifyToken,
  verifyRole(["admin"]),
  bannerController.reorderBanners
);

// Create a new banner (with image upload)
router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  bannerUpload.single("image"),
  bannerController.createBanner
);

// Get all banners
router.get(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  bannerController.getAllBanners
);

// Get banner by ID
router.get(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  bannerController.getBannerById
);

// Update a banner (with optional image upload)
router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  bannerUpload.single("image"),
  bannerController.updateBanner
);

// Delete a banner
router.delete(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  bannerController.deleteBanner
);

module.exports = router;
