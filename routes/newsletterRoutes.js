const express = require("express");
const multer = require("multer");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");
const {
  verifyToken,
  verifyPermission,
  verifyAnyPermission,
} = require("../middleware/authMiddleware");
const newsletterUpload = require("../middleware/newsletterUploadMiddleware");

const handleNewsletterUpload = (req, res, next) => {
  newsletterUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "attachment", maxCount: 1 },
  ])(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `Newsletter files must be ${newsletterUpload.limitMb}MB or smaller.`,
        error: { code: "FILE_TOO_LARGE" },
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Unable to upload newsletter files.",
      error: { code: "UPLOAD_ERROR" },
    });
  });
};

router.post(
  "/upload-policy",
  verifyToken,
  verifyAnyPermission("newsletters", ["create", "edit"]),
  newsletterController.createNewsletterUploadPolicy,
);

router.post(
  "/",
  verifyToken,
  verifyPermission("newsletters", "create"),
  handleNewsletterUpload,
  newsletterController.createNewsletter,
);

router.get("/", newsletterController.getAllNewsletters);
router.get("/:id", newsletterController.getNewsletterById);

router.put(
  "/:id",
  verifyToken,
  verifyPermission("newsletters", "edit"),
  handleNewsletterUpload,
  newsletterController.updateNewsletter,
);

router.delete("/:id", verifyToken, verifyPermission("newsletters", "delete"), newsletterController.deleteNewsletter);

module.exports = router;
