const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const resultDao = require("../dao/resultDao");
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

const parseYear = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1900 || parsed > 2155) {
    return null;
  }
  return parsed;
};

const createResult = async (req, res) => {
  try {
    const { title } = req.body;
    const year = parseYear(req.body.year);
    const pdf = req.file;

    if (!title || !pdf || year === null) {
      return error(res, 400, "Title, PDF, and valid year are required", {
        code: "MISSING_FIELDS",
      });
    }

    const item = await resultDao.createResult({
      title: title.trim(),
      pdf_url: pdf.location,
      pdf_key: pdf.key,
      year,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Result created successfully", item);
  } catch (err) {
    console.error("Create result error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllResults = async (req, res) => {
  try {
    const results = await resultDao.getAllResults();
    return ok(res, "Results fetched successfully", { results });
  } catch (err) {
    console.error("Get results error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getResultById = async (req, res) => {
  try {
    const item = await resultDao.getResultById(req.params.id);
    if (!item) {
      return error(res, 404, "Result not found");
    }
    return ok(res, "Result fetched successfully", item);
  } catch (err) {
    console.error("Get result error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateResult = async (req, res) => {
  try {
    const existing = await resultDao.getResultById(req.params.id);
    if (!existing) {
      return error(res, 404, "Result not found");
    }

    const updateData = {};
    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return error(res, 400, "Title is required", { code: "MISSING_FIELDS" });
      }
      updateData.title = req.body.title.trim();
    }
    if (req.body.year !== undefined) {
      const year = parseYear(req.body.year);
      if (year === null) {
        return error(res, 400, "Valid year is required", { code: "INVALID_DATA" });
      }
      updateData.year = year;
    }
    if (req.file) {
      updateData.pdf_url = req.file.location;
      updateData.pdf_key = req.file.key;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await resultDao.updateResult(req.params.id, updateData);

    if (req.file && existing.pdf_key) {
      try {
        await deleteS3Object(existing.pdf_key);
      } catch (s3Err) {
        console.error("Error deleting old result PDF from S3:", s3Err);
      }
    }

    return ok(res, "Result updated successfully");
  } catch (err) {
    console.error("Update result error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteResult = async (req, res) => {
  try {
    const result = await resultDao.deleteResult(req.params.id);
    if (!result) {
      return error(res, 404, "Result not found");
    }

    try {
      await deleteS3Object(result.pdfKey);
    } catch (s3Err) {
      console.error("Error deleting result PDF from S3:", s3Err);
    }

    return ok(res, "Result deleted successfully");
  } catch (err) {
    console.error("Delete result error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
};
