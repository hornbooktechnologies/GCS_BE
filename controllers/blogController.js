const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const blogDao = require("../dao/blogDao");
const { ok, created, error } = require("../utils/responseHandler");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const createBlog = async (req, res) => {
  try {
    const {
      title,
      description,
      author_name,
      author_designation,
      blog_date,
    } = req.body;
    const thumbnailImage = req.files?.thumbnail_image?.[0];
    const detailPageImage = req.files?.detail_image?.[0];

    if (
      !title ||
      !description ||
      !author_name ||
      !author_designation ||
      !blog_date
    ) {
      return error(res, 400, "All blog fields are required", {
        code: "MISSING_FIELDS",
      });
    }

    if (!thumbnailImage || !detailPageImage) {
      return error(
        res,
        400,
        "Thumbnail image and detail page image are required",
        { code: "MISSING_FILE" },
      );
    }

    const blog = await blogDao.createBlog({
      title,
      thumbnail_image_url: thumbnailImage.location,
      thumbnail_image_key: thumbnailImage.key,
      detail_image_url: detailPageImage.location,
      detail_image_key: detailPageImage.key,
      description,
      author_name,
      author_designation,
      blog_date,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Blog created successfully", blog);
  } catch (err) {
    console.error("Create blog error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await blogDao.getAllBlogs();
    return ok(res, "Blogs fetched successfully", { blogs });
  } catch (err) {
    console.error("Get blogs error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await blogDao.getBlogById(req.params.id);
    if (!blog) {
      return error(res, 404, "Blog not found");
    }
    return ok(res, "Blog fetched successfully", blog);
  } catch (err) {
    console.error("Get blog error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      author_name,
      author_designation,
      blog_date,
    } = req.body;
    const thumbnailImage = req.files?.thumbnail_image?.[0];
    const detailPageImage = req.files?.detail_image?.[0];

    const existing = await blogDao.getBlogById(id);
    if (!existing) {
      return error(res, 404, "Blog not found");
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (author_name !== undefined) updateData.author_name = author_name;
    if (author_designation !== undefined) {
      updateData.author_designation = author_designation;
    }
    if (blog_date !== undefined) updateData.blog_date = blog_date;

    if (thumbnailImage) {
      updateData.thumbnail_image_url = thumbnailImage.location;
      updateData.thumbnail_image_key = thumbnailImage.key;

      if (existing.thumbnail_image_key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: existing.thumbnail_image_key,
            }),
          );
        } catch (s3Err) {
          console.error("Error deleting old blog thumbnail image from S3:", s3Err);
        }
      }
    }

    if (detailPageImage) {
      updateData.detail_image_url = detailPageImage.location;
      updateData.detail_image_key = detailPageImage.key;

      if (existing.detail_image_key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: existing.detail_image_key,
            }),
          );
        } catch (s3Err) {
          console.error("Error deleting old blog detail image from S3:", s3Err);
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await blogDao.updateBlog(id, updateData);
    return ok(res, "Blog updated successfully");
  } catch (err) {
    console.error("Update blog error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const result = await blogDao.deleteBlog(req.params.id);
    if (!result) {
      return error(res, 404, "Blog not found");
    }

    try {
      if (result.thumbnailImageKey) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: result.thumbnailImageKey,
          }),
        );
      }
    } catch (s3Err) {
      console.error("Error deleting blog thumbnail image from S3:", s3Err);
    }

    try {
      if (result.detailImageKey) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: result.detailImageKey,
          }),
        );
      }
    } catch (s3Err) {
      console.error("Error deleting blog detail image from S3:", s3Err);
    }

    return ok(res, "Blog deleted successfully");
  } catch (err) {
    console.error("Delete blog error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const reorderBlogs = async (req, res) => {
  try {
    const { orderedItems } = req.body;

    if (!Array.isArray(orderedItems) || orderedItems.length === 0) {
      return error(res, 400, "orderedItems array is required", {
        code: "MISSING_FIELDS",
      });
    }

    for (const item of orderedItems) {
      if (!item.id || item.display_order === undefined) {
        return error(res, 400, "Each item must have 'id' and 'display_order'", {
          code: "INVALID_DATA",
        });
      }
    }

    await blogDao.updateBlogOrder(orderedItems);
    return ok(res, "Blog order updated successfully");
  } catch (err) {
    console.error("Reorder blogs error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  reorderBlogs,
};
