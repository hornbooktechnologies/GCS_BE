const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const newsletterUpload = require("../middleware/newsletterUploadMiddleware");

router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  newsletterUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "attachment", maxCount: 1 },
  ]),
  newsletterController.createNewsletter,
);

router.get("/", verifyToken, verifyRole(["admin"]), newsletterController.getAllNewsletters);
router.get("/:id", verifyToken, verifyRole(["admin"]), newsletterController.getNewsletterById);

router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  newsletterUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "attachment", maxCount: 1 },
  ]),
  newsletterController.updateNewsletter,
);

router.delete("/:id", verifyToken, verifyRole(["admin"]), newsletterController.deleteNewsletter);

module.exports = router;
