const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const doctorDao = require("../dao/doctorDao");
const specialityDao = require("../dao/specialityDao");
const { ok, created, error } = require("../utils/responseHandler");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const DEFAULT_DOCTOR_IMAGE = "/images/default-pic.jpg";

const deleteS3Object = async (key) => {
  if (!key || key.startsWith("/")) return;
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }),
  );
};

const isMeaningfulHtml = (html) =>
  html && html.replace(/<(.|\n)*?>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;

const normalizeSpecialityIds = (rawValue) => {
  if (Array.isArray(rawValue)) {
    return [...new Set(rawValue.filter(Boolean))];
  }

  if (typeof rawValue === "string" && rawValue.trim()) {
    try {
      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) {
        return [...new Set(parsed.filter(Boolean))];
      }
    } catch (parseError) {
      return [...new Set(rawValue.split(",").map((item) => item.trim()).filter(Boolean))];
    }
  }

  return [];
};

const parseNonNegativeInt = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
};

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return defaultValue;
};

const validateSpecialities = async (specialityIds) => {
  if (!specialityIds.length) {
    return false;
  }

  const specialities = await specialityDao.getAllSpecialities();
  const validIds = new Set(specialities.map((item) => item.id));
  return specialityIds.every((id) => validIds.has(id));
};

const createDoctor = async (req, res) => {
  try {
    const { name, experience, designation, description } = req.body;
    const specialityIds = normalizeSpecialityIds(req.body.speciality_ids);
    const displayOrder = parseNonNegativeInt(req.body.display_order);
    const parsedExperience = parseNonNegativeInt(experience);
    const image = req.file;
    const isHod = parseBoolean(req.body.is_hod, false);

    if (!name || parsedExperience === null || !designation || !isMeaningfulHtml(description) || !image || specialityIds.length === 0) {
      return error(res, 400, "All doctor fields are required", {
        code: "MISSING_FIELDS",
      });
    }

    if (displayOrder === null && req.body.display_order !== undefined && req.body.display_order !== "") {
      return error(res, 400, "Display order must be a non-negative integer", {
        code: "INVALID_DATA",
      });
    }

    const validSpecialities = await validateSpecialities(specialityIds);
    if (!validSpecialities) {
      return error(res, 400, "Selected specialities do not exist", {
        code: "INVALID_DATA",
      });
    }

    const doctor = await doctorDao.createDoctor({
      name: name.trim(),
      experience: parsedExperience,
      designation: designation.trim(),
      description,
      speciality_ids: specialityIds,
      display_order: displayOrder,
      is_hod: isHod,
      image_url: image.location,
      image_key: image.key,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Doctor created successfully", doctor);
  } catch (err) {
    console.error("Create doctor error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const reorderDoctors = async (req, res) => {
  try {
    const { orderedItems } = req.body;

    if (!Array.isArray(orderedItems) || orderedItems.length === 0) {
      return error(res, 400, "orderedItems array is required", {
        code: "MISSING_FIELDS",
      });
    }

    const seenIds = new Set();
    const normalizedItems = [];

    for (const item of orderedItems) {
      const displayOrder = parseNonNegativeInt(item?.display_order);
      if (!item?.id || displayOrder === null || seenIds.has(item.id)) {
        return error(res, 400, "Each doctor must have a unique id and valid display_order", {
          code: "INVALID_DATA",
        });
      }

      seenIds.add(item.id);
      normalizedItems.push({ id: item.id, display_order: displayOrder });
    }

    await doctorDao.updateDoctorOrder(normalizedItems);
    return ok(res, "Doctor order updated successfully");
  } catch (err) {
    console.error("Reorder doctors error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const { search, speciality_id, category, page = 1, limit = 20 } = req.query;
    const result = await doctorDao.getAllDoctors({
      search: search?.trim() || undefined,
      speciality_id: speciality_id || undefined,
      category: category || undefined,
      page: Math.max(1, Number.parseInt(page, 10) || 1),
      limit: Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20)),
    });

    return ok(res, "Doctors fetched", result);
  } catch (err) {
    console.error("Get doctors error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorDao.getDoctorById(req.params.id);
    if (!doctor) {
      return error(res, 404, "Doctor not found");
    }
    return ok(res, "Doctor fetched successfully", doctor);
  } catch (err) {
    console.error("Get doctor error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getDoctorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const doctor = await doctorDao.getDoctorBySlug(slug);
    if (!doctor) {
      return error(res, 404, "Doctor not found", { code: "NOT_FOUND" });
    }
    return ok(res, "Doctor fetched", { doctor });
  } catch (err) {
    console.error("Get doctor by slug error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { name, experience, designation, description } = req.body;
    const specialityIds = req.body.speciality_ids !== undefined ? normalizeSpecialityIds(req.body.speciality_ids) : null;
    const image = req.file;
    const removeImage = parseBoolean(req.body.remove_image, false);
    const existing = await doctorDao.getDoctorById(req.params.id);

    if (!existing) {
      return error(res, 404, "Doctor not found");
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (experience !== undefined) {
      const parsedExperience = parseNonNegativeInt(experience);
      if (parsedExperience === null) {
        return error(res, 400, "Experience must be a non-negative integer", {
          code: "INVALID_DATA",
        });
      }
      updateData.experience = parsedExperience;
    }
    if (designation !== undefined) updateData.designation = designation.trim();
    if (description !== undefined) {
      if (!isMeaningfulHtml(description)) {
        return error(res, 400, "Description is required", { code: "MISSING_FIELDS" });
      }
      updateData.description = description;
    }
    if (req.body.display_order !== undefined) {
      const displayOrder = parseNonNegativeInt(req.body.display_order);
      if (displayOrder === null) {
        return error(res, 400, "Display order must be a non-negative integer", {
          code: "INVALID_DATA",
        });
      }
      updateData.display_order = displayOrder;
    }
    if (req.body.is_hod !== undefined) {
      updateData.is_hod = parseBoolean(req.body.is_hod, false);
    }
    if (specialityIds !== null) {
      if (specialityIds.length === 0) {
        return error(res, 400, "At least one speciality is required", { code: "MISSING_FIELDS" });
      }
      const validSpecialities = await validateSpecialities(specialityIds);
      if (!validSpecialities) {
        return error(res, 400, "Selected specialities do not exist", { code: "INVALID_DATA" });
      }
      updateData.speciality_ids = specialityIds;
    }
    if (image) {
      updateData.image_url = image.location;
      updateData.image_key = image.key;
    } else if (removeImage) {
      updateData.image_url = DEFAULT_DOCTOR_IMAGE;
      updateData.image_key = DEFAULT_DOCTOR_IMAGE;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await doctorDao.updateDoctor(req.params.id, updateData);

    if ((image || removeImage) && existing.image_key && existing.image_key !== DEFAULT_DOCTOR_IMAGE) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old doctor image from S3:", s3Err);
      }
    }

    return ok(res, "Doctor updated successfully");
  } catch (err) {
    console.error("Update doctor error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const result = await doctorDao.deleteDoctor(req.params.id);
    if (!result) {
      return error(res, 404, "Doctor not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting doctor image from S3:", s3Err);
    }

    return ok(res, "Doctor deleted successfully");
  } catch (err) {
    console.error("Delete doctor error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  getDoctorBySlug,
  reorderDoctors,
  updateDoctor,
  deleteDoctor,
};
