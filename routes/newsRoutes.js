const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const newsUpload = require("../middleware/newsUploadMiddleware");

router.put("/reorder", verifyToken, verifyRole(["admin"]), newsController.reorderNews);
router.get("/", verifyToken, verifyRole(["admin"]), newsController.getAllNews);
router.get("/:id", verifyToken, verifyRole(["admin"]), newsController.getNewsById);
router.post("/", verifyToken, verifyRole(["admin"]), newsUpload.single("image"), newsController.createNews);
router.put("/:id", verifyToken, verifyRole(["admin"]), newsUpload.single("image"), newsController.updateNews);
router.delete("/:id", verifyToken, verifyRole(["admin"]), newsController.deleteNews);

module.exports = router;
