const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const newsUpload = require("../middleware/newsUploadMiddleware");

router.put("/reorder", verifyToken, verifyPermission("news", "edit"), newsController.reorderNews);
router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getNewsById);
router.post("/", verifyToken, verifyPermission("news", "create"), newsUpload.single("image"), newsController.createNews);
router.put("/:id", verifyToken, verifyPermission("news", "edit"), newsUpload.single("image"), newsController.updateNews);
router.delete("/:id", verifyToken, verifyPermission("news", "delete"), newsController.deleteNews);

module.exports = router;
