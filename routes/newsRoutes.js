const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const newsUpload = require("../middleware/newsUploadMiddleware");

router.put("/reorder", verifyToken, verifyPermission("news", "edit"), newsController.reorderNews);

router.get("/featured", newsController.getFeaturedNews);
router.get("/slug/:slug", newsController.getNewsBySlug);
router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getNewsById);
router.post(
  "/",
  verifyToken,
  verifyPermission("news", "create"),
  newsUpload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "detail_image", maxCount: 1 },
  ]),
  newsController.createNews,
);
router.put(
  "/:id",
  verifyToken,
  verifyPermission("news", "edit"),
  newsUpload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "detail_image", maxCount: 1 },
  ]),
  newsController.updateNews,
);
router.post(
  "/:id/featured",
  verifyToken,
  verifyPermission("news", "edit"),
  newsController.toggleFeatured,
);
router.delete("/:id", verifyToken, verifyPermission("news", "delete"), newsController.deleteNews);

module.exports = router;
