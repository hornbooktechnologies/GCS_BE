const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const careerDao = require("../dao/careerDao");
const sendEmail = require("../utils/emailService");
const { ok, created, error } = require("../utils/responseHandler");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const CAREER_ADMIN_EMAIL =
  process.env.CAREER_ADMIN_EMAIL ||
  process.env.ADMIN_EMAIL ||
  process.env.SMTP_FROM ||
  "admin@gcshospital.com";

const deleteS3Object = async (key) => {
  if (!key) return;
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }),
  );
};

const getTableNameForType = (type) => {
  if (type === "teaching") return "gcs_teaching_positions";
  if (type === "internship") return "gcs_internship_positions";
  return null;
};

const createCurrentOpening = async (req, res) => {
  try {
    const { position, education, description, experience } = req.body;
    if (!position || !education || !description || !experience) {
      return error(res, 400, "All current opening fields are required", {
        code: "MISSING_FIELDS",
      });
    }

    const opening = await careerDao.createCurrentOpening({
      position,
      education,
      description,
      experience,
      created_by: req.user ? req.user.id : null,
    });
    return created(res, "Current opening created successfully", opening);
  } catch (err) {
    console.error("Create current opening error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllCurrentOpenings = async (req, res) => {
  try {
    const openings = await careerDao.getAllCurrentOpenings();
    return ok(res, "Current openings fetched successfully", { openings });
  } catch (err) {
    console.error("Get current openings error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getCurrentOpeningById = async (req, res) => {
  try {
    const opening = await careerDao.getCurrentOpeningById(req.params.id);
    if (!opening) {
      return error(res, 404, "Current opening not found");
    }
    return ok(res, "Current opening fetched successfully", opening);
  } catch (err) {
    console.error("Get current opening error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateCurrentOpening = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, education, description, experience } = req.body;
    const existing = await careerDao.getCurrentOpeningById(id);
    if (!existing) {
      return error(res, 404, "Current opening not found");
    }

    const updateData = {};
    if (position !== undefined) updateData.position = position;
    if (education !== undefined) updateData.education = education;
    if (description !== undefined) updateData.description = description;
    if (experience !== undefined) updateData.experience = experience;
    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await careerDao.updateCurrentOpening(id, updateData);
    return ok(res, "Current opening updated successfully");
  } catch (err) {
    console.error("Update current opening error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteCurrentOpening = async (req, res) => {
  try {
    const success = await careerDao.deleteCurrentOpening(req.params.id);
    if (!success) {
      return error(res, 404, "Current opening not found");
    }
    return ok(res, "Current opening deleted successfully");
  } catch (err) {
    console.error("Delete current opening error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const submitCareerApplication = async (req, res) => {
  try {
    const { opening_id, position, name, email, contact_no, city, message } = req.body;
    const resume = req.file;

    if (!position || !name || !email || !contact_no || !city || !resume) {
      return error(res, 400, "All application fields except message are required", {
        code: "MISSING_FIELDS",
      });
    }

    const application = await careerDao.createCareerApplication({
      opening_id,
      position,
      name,
      email,
      contact_no,
      city,
      message,
      resume_url: resume.location,
      resume_key: resume.key,
    });

    const adminSubject = `New Career Application: ${position}`;
    const adminText = [
      `New application received for ${position}.`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Contact No: ${contact_no}`,
      `City: ${city}`,
      `Message: ${message || "N/A"}`,
      `Resume: ${resume.location}`,
    ].join("\n");

    const userSubject = "Your application was submitted successfully";
    const userText =
      `Hi ${name},\n\nYour application for ${position} has been submitted successfully. ` +
      "We will get back to you soon.\n\nRegards,\nGCS Hospital";

    await sendEmail(CAREER_ADMIN_EMAIL, adminSubject, adminText, adminText.replace(/\n/g, "<br />"));
    await sendEmail(email, userSubject, userText, userText.replace(/\n/g, "<br />"));

    return created(res, "Application submitted successfully", application);
  } catch (err) {
    console.error("Submit career application error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllCareerApplications = async (req, res) => {
  try {
    const applications = await careerDao.getAllCareerApplications();
    return ok(res, "Career applications fetched successfully", { applications });
  } catch (err) {
    console.error("Get career applications error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const createAssetPosition = async (req, res, type) => {
  try {
    const { title } = req.body;
    const image = req.files?.image?.[0];
    const pdf = req.files?.pdf?.[0];
    const tableName = getTableNameForType(type);

    if (!tableName) {
      return error(res, 400, "Invalid career section");
    }

    if (!title || !image || !pdf) {
      return error(res, 400, "Title, image, and PDF are required", {
        code: "MISSING_FIELDS",
      });
    }

    const item = await careerDao.createAssetPosition(tableName, {
      title,
      image_url: image.location,
      image_key: image.key,
      pdf_url: pdf.location,
      pdf_key: pdf.key,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, `${type} position created successfully`, item);
  } catch (err) {
    console.error(`Create ${type} position error:`, err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllAssetPositions = async (req, res, type) => {
  try {
    const tableName = getTableNameForType(type);
    const items = await careerDao.getAllAssetPositions(tableName);
    return ok(res, `${type} positions fetched successfully`, { items });
  } catch (err) {
    console.error(`Get ${type} positions error:`, err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAssetPositionById = async (req, res, type) => {
  try {
    const tableName = getTableNameForType(type);
    const item = await careerDao.getAssetPositionById(tableName, req.params.id);
    if (!item) {
      return error(res, 404, `${type} position not found`);
    }
    return ok(res, `${type} position fetched successfully`, item);
  } catch (err) {
    console.error(`Get ${type} position error:`, err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateAssetPosition = async (req, res, type) => {
  try {
    const tableName = getTableNameForType(type);
    const { title } = req.body;
    const image = req.files?.image?.[0];
    const pdf = req.files?.pdf?.[0];
    const existing = await careerDao.getAssetPositionById(tableName, req.params.id);

    if (!existing) {
      return error(res, 404, `${type} position not found`);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (image) {
      updateData.image_url = image.location;
      updateData.image_key = image.key;
    }
    if (pdf) {
      updateData.pdf_url = pdf.location;
      updateData.pdf_key = pdf.key;
    }
    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await careerDao.updateAssetPosition(tableName, req.params.id, updateData);

    if (image && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error(`Error deleting old ${type} image from S3:`, s3Err);
      }
    }
    if (pdf && existing.pdf_key) {
      try {
        await deleteS3Object(existing.pdf_key);
      } catch (s3Err) {
        console.error(`Error deleting old ${type} PDF from S3:`, s3Err);
      }
    }

    return ok(res, `${type} position updated successfully`);
  } catch (err) {
    console.error(`Update ${type} position error:`, err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteAssetPosition = async (req, res, type) => {
  try {
    const tableName = getTableNameForType(type);
    const result = await careerDao.deleteAssetPosition(tableName, req.params.id);
    if (!result) {
      return error(res, 404, `${type} position not found`);
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error(`Error deleting ${type} image from S3:`, s3Err);
    }
    try {
      await deleteS3Object(result.pdfKey);
    } catch (s3Err) {
      console.error(`Error deleting ${type} PDF from S3:`, s3Err);
    }

    return ok(res, `${type} position deleted successfully`);
  } catch (err) {
    console.error(`Delete ${type} position error:`, err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createCurrentOpening,
  getAllCurrentOpenings,
  getCurrentOpeningById,
  updateCurrentOpening,
  deleteCurrentOpening,
  submitCareerApplication,
  getAllCareerApplications,
  createTeachingPosition: (req, res) => createAssetPosition(req, res, "teaching"),
  getAllTeachingPositions: (req, res) => getAllAssetPositions(req, res, "teaching"),
  getTeachingPositionById: (req, res) => getAssetPositionById(req, res, "teaching"),
  updateTeachingPosition: (req, res) => updateAssetPosition(req, res, "teaching"),
  deleteTeachingPosition: (req, res) => deleteAssetPosition(req, res, "teaching"),
  createInternshipPosition: (req, res) => createAssetPosition(req, res, "internship"),
  getAllInternshipPositions: (req, res) => getAllAssetPositions(req, res, "internship"),
  getInternshipPositionById: (req, res) => getAssetPositionById(req, res, "internship"),
  updateInternshipPosition: (req, res) => updateAssetPosition(req, res, "internship"),
  deleteInternshipPosition: (req, res) => deleteAssetPosition(req, res, "internship"),
};
