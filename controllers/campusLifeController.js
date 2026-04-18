const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const campusLifeDao = require("../dao/campusLifeDao");
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

const createCampusLife = async (req, res) => {
  try {
    const { title } = req.body;
    const image = req.file;

    if (!title || !image) {
      return error(res, 400, "Title and image are required", {
        code: "MISSING_FIELDS",
      });
    }

    const item = await campusLifeDao.createCampusLife({
      title: title.trim(),
      image_url: image.location,
      image_key: image.key,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Campus life item created successfully", item);
  } catch (err) {
    console.error("Create campus life error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllCampusLife = async (req, res) => {
  try {
    const campusLifeItems = await campusLifeDao.getAllCampusLife();
    return ok(res, "Campus life items fetched successfully", { campusLifeItems });
  } catch (err) {
    console.error("Get campus life error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getCampusLifeById = async (req, res) => {
  try {
    const item = await campusLifeDao.getCampusLifeById(req.params.id);
    if (!item) {
      return error(res, 404, "Campus life item not found");
    }
    return ok(res, "Campus life item fetched successfully", item);
  } catch (err) {
    console.error("Get campus life item error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateCampusLife = async (req, res) => {
  try {
    const existing = await campusLifeDao.getCampusLifeById(req.params.id);
    if (!existing) {
      return error(res, 404, "Campus life item not found");
    }

    const updateData = {};
    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return error(res, 400, "Title is required", { code: "MISSING_FIELDS" });
      }
      updateData.title = req.body.title.trim();
    }
    if (req.file) {
      updateData.image_url = req.file.location;
      updateData.image_key = req.file.key;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await campusLifeDao.updateCampusLife(req.params.id, updateData);

    if (req.file && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old campus life image from S3:", s3Err);
      }
    }

    return ok(res, "Campus life item updated successfully");
  } catch (err) {
    console.error("Update campus life error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteCampusLife = async (req, res) => {
  try {
    const result = await campusLifeDao.deleteCampusLife(req.params.id);
    if (!result) {
      return error(res, 404, "Campus life item not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting campus life image from S3:", s3Err);
    }

    return ok(res, "Campus life item deleted successfully");
  } catch (err) {
    console.error("Delete campus life error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createCampusLife,
  getAllCampusLife,
  getCampusLifeById,
  updateCampusLife,
  deleteCampusLife,
};
