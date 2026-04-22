const express = require("express");
const router = express.Router();
const socialProfileController = require("../controllers/socialProfileController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

router.get(
  "/",
  socialProfileController.getSocialProfiles,
);

router.put(
  "/",
  verifyToken,
  verifyPermission("social-profiles", "edit"),
  socialProfileController.updateSocialProfiles,
);

module.exports = router;
