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

const deleteS3Object = async (key) => {
  if (!key) return;
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
    } catch (error) {
      return [...new Set(rawValue.split(",").map((item) => item.trim()).filter(Boolean))];
    }
  }

  return [];
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
    const image = req.file;

    if (!name || !experience || !designation || !isMeaningfulHtml(description) || !image || specialityIds.length === 0) {
      return error(res, 400, "All doctor fields are required", {
        code: "MISSING_FIELDS",
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
      experience: experience.trim(),
      designation: designation.trim(),
      description,
      speciality_ids: specialityIds,
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

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorDao.getAllDoctors();
    return ok(res, "Doctors fetched successfully", { doctors });
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

const updateDoctor = async (req, res) => {
  try {
    const { name, experience, designation, description } = req.body;
    const specialityIds = req.body.speciality_ids !== undefined ? normalizeSpecialityIds(req.body.speciality_ids) : null;
    const image = req.file;
    const existing = await doctorDao.getDoctorById(req.params.id);

    if (!existing) {
      return error(res, 404, "Doctor not found");
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (experience !== undefined) updateData.experience = experience.trim();
    if (designation !== undefined) updateData.designation = designation.trim();
    if (description !== undefined) {
      if (!isMeaningfulHtml(description)) {
        return error(res, 400, "Description is required", { code: "MISSING_FIELDS" });
      }
      updateData.description = description;
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
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await doctorDao.updateDoctor(req.params.id, updateData);

    if (image && existing.image_key) {
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
  updateDoctor,
  deleteDoctor,
};
