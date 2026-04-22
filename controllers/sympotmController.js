const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const sympotmDao = require("../dao/sympotmDao");
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

const normalizePotentialCauses = (rawValue) => {
  if (Array.isArray(rawValue)) {
    return rawValue;
  }

  if (typeof rawValue === "string" && rawValue.trim()) {
    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch (parseError) {
      return [];
    }
  }

  return [];
};

const sanitizePotentialCauses = (items) =>
  items.map((item) => ({
    title: typeof item?.title === "string" ? item.title.trim() : "",
    description: typeof item?.description === "string" ? item.description.trim() : "",
  }));

const hasValidPotentialCauses = (items) =>
  items.length > 0 && items.every((item) => item.title && item.description);

const getAllSympotms = async (req, res) => {
  try {
    const sympotms = await sympotmDao.getAllSympotms();
    return ok(res, "Sympotms fetched successfully", { sympotms });
  } catch (err) {
    console.error("Get sympotms error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getSympotmById = async (req, res) => {
  try {
    const sympotm = await sympotmDao.getSympotmById(req.params.id);
    if (!sympotm) {
      return error(res, 404, "Sympotm not found");
    }
    return ok(res, "Sympotm fetched successfully", sympotm);
  } catch (err) {
    console.error("Get sympotm error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const createSympotm = async (req, res) => {
  try {
    const { name, subtitle } = req.body;
    const image = req.file;
    const potentialCauses = sanitizePotentialCauses(
      normalizePotentialCauses(req.body.potential_causes),
    );

    if (!name || !subtitle || !image || !hasValidPotentialCauses(potentialCauses)) {
      return error(res, 400, "Name, subtitle, image, and valid potential causes are required", {
        code: "MISSING_FIELDS",
      });
    }

    const sympotm = await sympotmDao.createSympotm({
      name: name.trim(),
      subtitle: subtitle.trim(),
      image_url: image.location,
      image_key: image.key,
      potential_causes: potentialCauses,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Sympotm created successfully", sympotm);
  } catch (err) {
    console.error("Create sympotm error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateSympotm = async (req, res) => {
  try {
    const existing = await sympotmDao.getSympotmById(req.params.id);
    if (!existing) {
      return error(res, 404, "Sympotm not found");
    }

    const updateData = {};

    if (req.body.name !== undefined) {
      if (!req.body.name.trim()) {
        return error(res, 400, "Name is required", { code: "MISSING_FIELDS" });
      }
      updateData.name = req.body.name.trim();
    }

    if (req.body.subtitle !== undefined) {
      if (!req.body.subtitle.trim()) {
        return error(res, 400, "Subtitle is required", { code: "MISSING_FIELDS" });
      }
      updateData.subtitle = req.body.subtitle.trim();
    }

    if (req.body.potential_causes !== undefined) {
      const potentialCauses = sanitizePotentialCauses(
        normalizePotentialCauses(req.body.potential_causes),
      );

      if (!hasValidPotentialCauses(potentialCauses)) {
        return error(res, 400, "At least one valid potential cause is required", {
          code: "MISSING_FIELDS",
        });
      }

      updateData.potential_causes = potentialCauses;
    }

    if (req.file) {
      updateData.image_url = req.file.location;
      updateData.image_key = req.file.key;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    const sympotm = await sympotmDao.updateSympotm(req.params.id, updateData);

    if (req.file && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old sympotm image from S3:", s3Err);
      }
    }

    return ok(res, "Sympotm updated successfully", sympotm);
  } catch (err) {
    console.error("Update sympotm error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteSympotm = async (req, res) => {
  try {
    const result = await sympotmDao.deleteSympotm(req.params.id);
    if (!result) {
      return error(res, 404, "Sympotm not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting sympotm image from S3:", s3Err);
    }

    return ok(res, "Sympotm deleted successfully");
  } catch (err) {
    console.error("Delete sympotm error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  getAllSympotms,
  getSympotmById,
  createSympotm,
  updateSympotm,
  deleteSympotm,
};
