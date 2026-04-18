const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const awardDao = require("../dao/awardDao");
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

const createAward = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file;

    if (!name || !description || !image) {
      return error(res, 400, "Name, image, and description are required", {
        code: "MISSING_FIELDS",
      });
    }

    const award = await awardDao.createAward({
      name,
      description,
      image_url: image.location,
      image_key: image.key,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Award created successfully", award);
  } catch (err) {
    console.error("Create award error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllAwards = async (req, res) => {
  try {
    const awards = await awardDao.getAllAwards();
    return ok(res, "Awards fetched successfully", { awards });
  } catch (err) {
    console.error("Get awards error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAwardById = async (req, res) => {
  try {
    const award = await awardDao.getAwardById(req.params.id);
    if (!award) {
      return error(res, 404, "Award not found");
    }
    return ok(res, "Award fetched successfully", award);
  } catch (err) {
    console.error("Get award error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateAward = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file;
    const existing = await awardDao.getAwardById(req.params.id);

    if (!existing) {
      return error(res, 404, "Award not found");
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image) {
      updateData.image_url = image.location;
      updateData.image_key = image.key;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await awardDao.updateAward(req.params.id, updateData);

    if (image && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old award image from S3:", s3Err);
      }
    }

    return ok(res, "Award updated successfully");
  } catch (err) {
    console.error("Update award error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteAward = async (req, res) => {
  try {
    const result = await awardDao.deleteAward(req.params.id);
    if (!result) {
      return error(res, 404, "Award not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting award image from S3:", s3Err);
    }

    return ok(res, "Award deleted successfully");
  } catch (err) {
    console.error("Delete award error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const reorderAwards = async (req, res) => {
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

    await awardDao.updateAwardOrder(orderedItems);
    return ok(res, "Award order updated successfully");
  } catch (err) {
    console.error("Reorder awards error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createAward,
  getAllAwards,
  getAwardById,
  updateAward,
  deleteAward,
  reorderAwards,
};
