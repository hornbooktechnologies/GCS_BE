const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const newsDao = require("../dao/newsDao");
const { ok, created, error } = require("../utils/responseHandler");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const deleteS3Object = async (key) => {
  if (!key) return;
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (err) {
    console.error("Error deleting S3 object:", key, err);
    // Don't throw, just log - deletion is non-critical
  }
};

const createNews = async (req, res) => {
  try {
    const { title, content, published_date, status = "draft", featured = false } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return error(res, 400, "Title and content are required", {
        code: "MISSING_FIELDS",
      });
    }

    if (status && !["draft", "published"].includes(status)) {
      return error(res, 400, "Status must be either 'draft' or 'published'", {
        code: "INVALID_STATUS",
      });
    }

    const thumbnailImage = req.files?.thumbnail_image?.[0];
    const detailImage = req.files?.detail_image?.[0];

    if (!thumbnailImage || !detailImage) {
      return error(res, 400, "Both thumbnail_image and detail_image are required", {
        code: "MISSING_FILES",
      });
    }

    const newsItem = await newsDao.createNews({
      title: title.trim(),
      content: content.trim(),
      thumbnail_image_url: thumbnailImage.location,
      thumbnail_image_key: thumbnailImage.key,
      detail_image_url: detailImage.location,
      detail_image_key: detailImage.key,
      published_date,
      status,
      featured: featured === "true" || featured === true,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "News created successfully", newsItem);
  } catch (err) {
    console.error("Create news error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllNews = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const status = req.query.status?.trim() || "published";
    const featured =
      typeof req.query.featured === "string"
        ? req.query.featured.toLowerCase() === "true"
        : null;
    const sortBy = req.query.sort || "date";
    const search = req.query.search?.trim() || undefined;

    if (!["published", "draft", "all"].includes(status)) {
      return error(res, 400, "Status must be 'published', 'draft', or 'all'", {
        code: "INVALID_STATUS",
      });
    }

    const result = await newsDao.getAllNews(page, limit, {
      status,
      featured,
      sortBy,
      search,
    });

    return ok(res, "News fetched successfully", {
      items: result.rows,
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    });
  } catch (err) {
    console.error("Get news error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const newsItem = await newsDao.getNewsById(req.params.id);
    if (!newsItem) {
      return error(res, 404, "News item not found");
    }
    return ok(res, "News item fetched successfully", newsItem);
  } catch (err) {
    console.error("Get news item error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getNewsBySlug = async (req, res) => {
  try {
    const newsItem = await newsDao.getNewsBySlug(req.params.slug);
    if (!newsItem) {
      return error(res, 404, "News item not found");
    }
    return ok(res, "News item fetched successfully", { item: newsItem });
  } catch (err) {
    console.error("Get news by slug error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getFeaturedNews = async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 5));
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

    const result = await newsDao.getFeaturedNews(limit, page);

    return ok(res, "Featured news fetched successfully", {
      items: result.rows,
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    });
  } catch (err) {
    console.error("Get featured news error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, published_date, status, featured } = req.body;

    const existing = await newsDao.getNewsById(id);
    if (!existing) {
      return error(res, 404, "News item not found");
    }

    if (status !== undefined && !["draft", "published"].includes(status)) {
      return error(res, 400, "Status must be either 'draft' or 'published'", {
        code: "INVALID_STATUS",
      });
    }

    const thumbnailImage = req.files?.thumbnail_image?.[0];
    const detailImage = req.files?.detail_image?.[0];

    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (published_date !== undefined) updateData.published_date = published_date;
    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured === "true" || featured === true;

    if (thumbnailImage) {
      updateData.thumbnail_image_url = thumbnailImage.location;
      updateData.thumbnail_image_key = thumbnailImage.key;

      if (existing.thumbnail_image_key) {
        await deleteS3Object(existing.thumbnail_image_key);
      }
    }

    if (detailImage) {
      updateData.detail_image_url = detailImage.location;
      updateData.detail_image_key = detailImage.key;

      if (existing.detail_image_key) {
        await deleteS3Object(existing.detail_image_key);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    if (updateData.title === "") {
      return error(res, 400, "Title cannot be empty", { code: "INVALID_TITLE" });
    }

    if (updateData.content === "") {
      return error(res, 400, "Content cannot be empty", { code: "INVALID_CONTENT" });
    }

    const updatedNews = await newsDao.updateNews(id, updateData);

    return ok(res, "News item updated successfully", { item: updatedNews });
  } catch (err) {
    console.error("Update news error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    const result = await newsDao.deleteNews(req.params.id);
    if (!result) {
      return error(res, 404, "News item not found");
    }

    if (result.thumbnailImageKey) {
      await deleteS3Object(result.thumbnailImageKey);
    }
    if (result.detailImageKey) {
      await deleteS3Object(result.detailImageKey);
    }

    return ok(res, "News item deleted successfully");
  } catch (err) {
    console.error("Delete news error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const reorderNews = async (req, res) => {
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

    await newsDao.updateNewsOrder(orderedItems);
    return ok(res, "News order updated successfully");
  } catch (err) {
    console.error("Reorder news error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await newsDao.toggleFeatured(id);
    if (result === null) {
      return error(res, 404, "News item not found");
    }

    return ok(res, `News item ${result ? "featured" : "unfeatured"} successfully`, {
      featured: result,
    });
  } catch (err) {
    console.error("Toggle featured error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createNews,
  getAllNews,
  getNewsById,
  getNewsBySlug,
  getFeaturedNews,
  updateNews,
  deleteNews,
  reorderNews,
  toggleFeatured,
};
