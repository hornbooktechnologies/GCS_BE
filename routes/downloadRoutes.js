const express = require("express");
const router = express.Router();
const downloadController = require("../controllers/downloadController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const downloadUpload = require("../middleware/downloadUploadMiddleware");

router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  downloadUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  downloadController.createDownload,
);

router.get("/", verifyToken, verifyRole(["admin"]), downloadController.getAllDownloads);
router.get("/:id", verifyToken, verifyRole(["admin"]), downloadController.getDownloadById);

router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  downloadUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  downloadController.updateDownload,
);

router.delete("/:id", verifyToken, verifyRole(["admin"]), downloadController.deleteDownload);

module.exports = router;
