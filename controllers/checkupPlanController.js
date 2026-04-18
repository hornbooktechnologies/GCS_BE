const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const checkupPlanDao = require("../dao/checkupPlanDao");
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
  if (!key) {
    return;
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }),
  );
};

const normalizeTestNames = (rawValue) => {
  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof rawValue === "string" && rawValue.trim()) {
    try {
      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (parseError) {
      return rawValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const parsePrice = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : null;
};

const createCheckupPlan = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file;
    const price = parsePrice(req.body.price);
    const testNames = normalizeTestNames(req.body.test_names);

    if (!name || !image || price === null || testNames.length === 0) {
      return error(res, 400, "Name, image, price, and at least one test name are required", {
        code: "MISSING_FIELDS",
      });
    }

    const plan = await checkupPlanDao.createCheckupPlan({
      name: name.trim(),
      image_url: image.location,
      image_key: image.key,
      price,
      test_names: testNames,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Checkup plan created successfully", plan);
  } catch (err) {
    console.error("Create checkup plan error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllCheckupPlans = async (req, res) => {
  try {
    const checkupPlans = await checkupPlanDao.getAllCheckupPlans();
    return ok(res, "Checkup plans fetched successfully", { checkupPlans });
  } catch (err) {
    console.error("Get checkup plans error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getCheckupPlanById = async (req, res) => {
  try {
    const plan = await checkupPlanDao.getCheckupPlanById(req.params.id);
    if (!plan) {
      return error(res, 404, "Checkup plan not found");
    }
    return ok(res, "Checkup plan fetched successfully", plan);
  } catch (err) {
    console.error("Get checkup plan error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateCheckupPlan = async (req, res) => {
  try {
    const existing = await checkupPlanDao.getCheckupPlanById(req.params.id);
    if (!existing) {
      return error(res, 404, "Checkup plan not found");
    }

    const updateData = {};

    if (req.body.name !== undefined) {
      if (!req.body.name.trim()) {
        return error(res, 400, "Name is required", { code: "MISSING_FIELDS" });
      }
      updateData.name = req.body.name.trim();
    }

    if (req.body.price !== undefined) {
      const price = parsePrice(req.body.price);
      if (price === null) {
        return error(res, 400, "Valid price is required", { code: "INVALID_DATA" });
      }
      updateData.price = price;
    }

    if (req.body.test_names !== undefined) {
      const testNames = normalizeTestNames(req.body.test_names);
      if (testNames.length === 0) {
        return error(res, 400, "At least one test name is required", { code: "MISSING_FIELDS" });
      }
      updateData.test_names = testNames;
    }

    if (req.file) {
      updateData.image_url = req.file.location;
      updateData.image_key = req.file.key;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    const plan = await checkupPlanDao.updateCheckupPlan(req.params.id, updateData);

    if (req.file && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old checkup plan image from S3:", s3Err);
      }
    }

    return ok(res, "Checkup plan updated successfully", plan);
  } catch (err) {
    console.error("Update checkup plan error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteCheckupPlan = async (req, res) => {
  try {
    const result = await checkupPlanDao.deleteCheckupPlan(req.params.id);
    if (!result) {
      return error(res, 404, "Checkup plan not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting checkup plan image from S3:", s3Err);
    }

    return ok(res, "Checkup plan deleted successfully");
  } catch (err) {
    console.error("Delete checkup plan error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createCheckupPlan,
  getAllCheckupPlans,
  getCheckupPlanById,
  updateCheckupPlan,
  deleteCheckupPlan,
};
