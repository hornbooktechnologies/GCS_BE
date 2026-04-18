const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const blogUpload = require("../middleware/blogUploadMiddleware");

router.put(
  "/reorder",
  verifyToken,
  verifyRole(["admin"]),
  blogController.reorderBlogs,
);

router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  blogUpload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "detail_image", maxCount: 1 },
  ]),
  blogController.createBlog,
);

router.get("/", verifyToken, verifyRole(["admin"]), blogController.getAllBlogs);

router.get(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  blogController.getBlogById,
);

router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  blogUpload.fields([
    { name: "thumbnail_image", maxCount: 1 },
    { name: "detail_image", maxCount: 1 },
  ]),
  blogController.updateBlog,
);

router.delete(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  blogController.deleteBlog,
);

module.exports = router;
