const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const resultUpload = require("../middleware/resultUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), resultController.getAllResults);
router.get("/:id", verifyToken, verifyRole(["admin"]), resultController.getResultById);
router.post("/", verifyToken, verifyRole(["admin"]), resultUpload.single("pdf"), resultController.createResult);
router.put("/:id", verifyToken, verifyRole(["admin"]), resultUpload.single("pdf"), resultController.updateResult);
router.delete("/:id", verifyToken, verifyRole(["admin"]), resultController.deleteResult);

module.exports = router;
