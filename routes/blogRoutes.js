const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const blogUpload = require("../middleware/blogUploadMiddleware");

router.put(
  "/reorder",
  verifyToken,
  verifyPermission("blogs", "edit"),
  blogController.reorderBlogs,
);

router.post(
  "/",
  verifyToken,
  verifyPermission("blogs", "create"),
  blogUpload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "detail_image", maxCount: 1 },
  ]),
  blogController.createBlog,
);

router.get("/", blogController.getAllBlogs);

router.get(
  "/:id",
  blogController.getBlogById,
);

router.put(
  "/:id",
  verifyToken,
  verifyPermission("blogs", "edit"),
  blogUpload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "detail_image", maxCount: 1 },
  ]),
  blogController.updateBlog,
);

router.delete(
  "/:id",
  verifyToken,
  verifyPermission("blogs", "delete"),
  blogController.deleteBlog,
);

module.exports = router;
