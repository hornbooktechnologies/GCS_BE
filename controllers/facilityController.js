const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const facilityDao = require("../dao/facilityDao");
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

const createFacility = async (req, res) => {
  try {
    const { title } = req.body;
    const image = req.file;

    if (!title || !image) {
      return error(res, 400, "Title and image are required", {
        code: "MISSING_FIELDS",
      });
    }

    const item = await facilityDao.createFacility({
      title: title.trim(),
      image_url: image.location,
      image_key: image.key,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Facility created successfully", item);
  } catch (err) {
    console.error("Create facility error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllFacilities = async (req, res) => {
  try {
    const facilities = await facilityDao.getAllFacilities();
    return ok(res, "Facilities fetched successfully", { facilities });
  } catch (err) {
    console.error("Get facilities error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getFacilityById = async (req, res) => {
  try {
    const item = await facilityDao.getFacilityById(req.params.id);
    if (!item) {
      return error(res, 404, "Facility not found");
    }
    return ok(res, "Facility fetched successfully", item);
  } catch (err) {
    console.error("Get facility error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateFacility = async (req, res) => {
  try {
    const existing = await facilityDao.getFacilityById(req.params.id);
    if (!existing) {
      return error(res, 404, "Facility not found");
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

    await facilityDao.updateFacility(req.params.id, updateData);

    if (req.file && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old facility image from S3:", s3Err);
      }
    }

    return ok(res, "Facility updated successfully");
  } catch (err) {
    console.error("Update facility error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteFacility = async (req, res) => {
  try {
    const result = await facilityDao.deleteFacility(req.params.id);
    if (!result) {
      return error(res, 404, "Facility not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting facility image from S3:", s3Err);
    }

    return ok(res, "Facility deleted successfully");
  } catch (err) {
    console.error("Delete facility error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createFacility,
  getAllFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
};
