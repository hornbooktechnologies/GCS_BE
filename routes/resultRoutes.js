const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const resultUpload = require("../middleware/resultUploadMiddleware");

router.get("/", resultController.getAllResults);
router.get("/:id", resultController.getResultById);
router.post("/", verifyToken, verifyPermission("results", "create"), resultUpload.single("pdf"), resultController.createResult);
router.put("/:id", verifyToken, verifyPermission("results", "edit"), resultUpload.single("pdf"), resultController.updateResult);
router.delete("/:id", verifyToken, verifyPermission("results", "delete"), resultController.deleteResult);

module.exports = router;
