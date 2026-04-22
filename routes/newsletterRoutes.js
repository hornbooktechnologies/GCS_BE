const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const newsletterUpload = require("../middleware/newsletterUploadMiddleware");

router.post(
  "/",
  verifyToken,
  verifyPermission("newsletters", "create"),
  newsletterUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "attachment", maxCount: 1 },
  ]),
  newsletterController.createNewsletter,
);

router.get("/", newsletterController.getAllNewsletters);
router.get("/:id", newsletterController.getNewsletterById);

router.put(
  "/:id",
  verifyToken,
  verifyPermission("newsletters", "edit"),
  newsletterUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "attachment", maxCount: 1 },
  ]),
  newsletterController.updateNewsletter,
);

router.delete("/:id", verifyToken, verifyPermission("newsletters", "delete"), newsletterController.deleteNewsletter);

module.exports = router;
