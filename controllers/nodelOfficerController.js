const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const nodelOfficerDao = require("../dao/nodelOfficerDao");
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

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const createNodelOfficer = async (req, res) => {
  try {
    const { name, position, address, phone_number, email } = req.body;
    const image = req.file;

    if (!name || !position || !address || !phone_number || !email || !image) {
      return error(res, 400, "All nodel officer fields are required", {
        code: "MISSING_FIELDS",
      });
    }

    if (!isValidEmail(email.trim())) {
      return error(res, 400, "Valid email is required", {
        code: "INVALID_DATA",
      });
    }

    const item = await nodelOfficerDao.createNodelOfficer({
      name: name.trim(),
      image_url: image.location,
      image_key: image.key,
      position: position.trim(),
      address: address.trim(),
      phone_number: phone_number.trim(),
      email: email.trim(),
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Nodel officer created successfully", item);
  } catch (err) {
    console.error("Create nodel officer error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllNodelOfficers = async (req, res) => {
  try {
    const nodelOfficers = await nodelOfficerDao.getAllNodelOfficers();
    return ok(res, "Nodel officers fetched successfully", { nodelOfficers });
  } catch (err) {
    console.error("Get nodel officers error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getNodelOfficerById = async (req, res) => {
  try {
    const item = await nodelOfficerDao.getNodelOfficerById(req.params.id);
    if (!item) {
      return error(res, 404, "Nodel officer not found");
    }
    return ok(res, "Nodel officer fetched successfully", item);
  } catch (err) {
    console.error("Get nodel officer error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateNodelOfficer = async (req, res) => {
  try {
    const existing = await nodelOfficerDao.getNodelOfficerById(req.params.id);
    if (!existing) {
      return error(res, 404, "Nodel officer not found");
    }

    const updateData = {};
    const { name, position, address, phone_number, email } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return error(res, 400, "Name is required", { code: "MISSING_FIELDS" });
      }
      updateData.name = name.trim();
    }
    if (position !== undefined) {
      if (!position.trim()) {
        return error(res, 400, "Position is required", { code: "MISSING_FIELDS" });
      }
      updateData.position = position.trim();
    }
    if (address !== undefined) {
      if (!address.trim()) {
        return error(res, 400, "Address is required", { code: "MISSING_FIELDS" });
      }
      updateData.address = address.trim();
    }
    if (phone_number !== undefined) {
      if (!phone_number.trim()) {
        return error(res, 400, "Phone number is required", { code: "MISSING_FIELDS" });
      }
      updateData.phone_number = phone_number.trim();
    }
    if (email !== undefined) {
      if (!email.trim() || !isValidEmail(email.trim())) {
        return error(res, 400, "Valid email is required", { code: "INVALID_DATA" });
      }
      updateData.email = email.trim();
    }
    if (req.file) {
      updateData.image_url = req.file.location;
      updateData.image_key = req.file.key;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await nodelOfficerDao.updateNodelOfficer(req.params.id, updateData);

    if (req.file && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old nodel officer image from S3:", s3Err);
      }
    }

    return ok(res, "Nodel officer updated successfully");
  } catch (err) {
    console.error("Update nodel officer error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteNodelOfficer = async (req, res) => {
  try {
    const result = await nodelOfficerDao.deleteNodelOfficer(req.params.id);
    if (!result) {
      return error(res, 404, "Nodel officer not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting nodel officer image from S3:", s3Err);
    }

    return ok(res, "Nodel officer deleted successfully");
  } catch (err) {
    console.error("Delete nodel officer error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createNodelOfficer,
  getAllNodelOfficers,
  getNodelOfficerById,
  updateNodelOfficer,
  deleteNodelOfficer,
};
