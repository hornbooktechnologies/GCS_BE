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
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }),
  );
};

const createNews = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file;

    if (!name || !image) {
      return error(res, 400, "Name and image are required", {
        code: "MISSING_FIELDS",
      });
    }

    const item = await newsDao.createNews({
      name,
      image_url: image.location,
      image_key: image.key,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "News created successfully", item);
  } catch (err) {
    console.error("Create news error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllNews = async (req, res) => {
  try {
    const news = await newsDao.getAllNews();
    return ok(res, "News fetched successfully", { news });
  } catch (err) {
    console.error("Get news error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const item = await newsDao.getNewsById(req.params.id);
    if (!item) {
      return error(res, 404, "News item not found");
    }
    return ok(res, "News item fetched successfully", item);
  } catch (err) {
    console.error("Get news item error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file;
    const existing = await newsDao.getNewsById(req.params.id);

    if (!existing) {
      return error(res, 404, "News item not found");
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (image) {
      updateData.image_url = image.location;
      updateData.image_key = image.key;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await newsDao.updateNews(req.params.id, updateData);

    if (image && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old news image from S3:", s3Err);
      }
    }

    return ok(res, "News item updated successfully");
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

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting news image from S3:", s3Err);
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

module.exports = {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  reorderNews,
};
