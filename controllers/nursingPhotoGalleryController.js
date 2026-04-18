const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const nursingPhotoGalleryDao = require("../dao/nursingPhotoGalleryDao");
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

const createNursingPhoto = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file;

    if (!name || !image) {
      return error(res, 400, "Name and image are required", {
        code: "MISSING_FIELDS",
      });
    }

    const item = await nursingPhotoGalleryDao.createNursingPhoto({
      name: name.trim(),
      image_url: image.location,
      image_key: image.key,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Nursing photo created successfully", item);
  } catch (err) {
    console.error("Create nursing photo error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllNursingPhotos = async (req, res) => {
  try {
    const nursingPhotos = await nursingPhotoGalleryDao.getAllNursingPhotos();
    return ok(res, "Nursing photos fetched successfully", { nursingPhotos });
  } catch (err) {
    console.error("Get nursing photos error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getNursingPhotoById = async (req, res) => {
  try {
    const item = await nursingPhotoGalleryDao.getNursingPhotoById(req.params.id);
    if (!item) {
      return error(res, 404, "Nursing photo not found");
    }
    return ok(res, "Nursing photo fetched successfully", item);
  } catch (err) {
    console.error("Get nursing photo error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateNursingPhoto = async (req, res) => {
  try {
    const existing = await nursingPhotoGalleryDao.getNursingPhotoById(req.params.id);
    if (!existing) {
      return error(res, 404, "Nursing photo not found");
    }

    const updateData = {};
    if (req.body.name !== undefined) {
      if (!req.body.name.trim()) {
        return error(res, 400, "Name is required", { code: "MISSING_FIELDS" });
      }
      updateData.name = req.body.name.trim();
    }
    if (req.file) {
      updateData.image_url = req.file.location;
      updateData.image_key = req.file.key;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await nursingPhotoGalleryDao.updateNursingPhoto(req.params.id, updateData);

    if (req.file && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old nursing photo from S3:", s3Err);
      }
    }

    return ok(res, "Nursing photo updated successfully");
  } catch (err) {
    console.error("Update nursing photo error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteNursingPhoto = async (req, res) => {
  try {
    const result = await nursingPhotoGalleryDao.deleteNursingPhoto(req.params.id);
    if (!result) {
      return error(res, 404, "Nursing photo not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting nursing photo from S3:", s3Err);
    }

    return ok(res, "Nursing photo deleted successfully");
  } catch (err) {
    console.error("Delete nursing photo error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createNursingPhoto,
  getAllNursingPhotos,
  getNursingPhotoById,
  updateNursingPhoto,
  deleteNursingPhoto,
};
