const express = require("express");
const router = express.Router();
const socialProfileController = require("../controllers/socialProfileController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.get(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  socialProfileController.getSocialProfiles,
);

router.put(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  socialProfileController.updateSocialProfiles,
);

module.exports = router;
