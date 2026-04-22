const express = require("express");
const router = express.Router();
const downloadController = require("../controllers/downloadController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const downloadUpload = require("../middleware/downloadUploadMiddleware");

router.post(
  "/",
  verifyToken,
  verifyPermission("downloads", "create"),
  downloadUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  downloadController.createDownload,
);

router.get("/", downloadController.getAllDownloads);
router.get("/:id", downloadController.getDownloadById);

router.put(
  "/:id",
  verifyToken,
  verifyPermission("downloads", "edit"),
  downloadUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  downloadController.updateDownload,
);

router.delete("/:id", verifyToken, verifyPermission("downloads", "delete"), downloadController.deleteDownload);

module.exports = router;
