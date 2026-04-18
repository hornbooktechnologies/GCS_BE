const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const studentTestimonialDao = require("../dao/studentTestimonialDao");
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

const createStudentTestimonial = async (req, res) => {
  try {
    const { title, position, description } = req.body;
    const image = req.file;

    if (!title || !position || !description || !image) {
      return error(res, 400, "Title, position, description, and image are required", {
        code: "MISSING_FIELDS",
      });
    }

    const item = await studentTestimonialDao.createStudentTestimonial({
      title: title.trim(),
      position: position.trim(),
      image_url: image.location,
      image_key: image.key,
      description: description.trim(),
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Student testimonial created successfully", item);
  } catch (err) {
    console.error("Create student testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllStudentTestimonials = async (req, res) => {
  try {
    const studentTestimonials = await studentTestimonialDao.getAllStudentTestimonials();
    return ok(res, "Student testimonials fetched successfully", { studentTestimonials });
  } catch (err) {
    console.error("Get student testimonials error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getStudentTestimonialById = async (req, res) => {
  try {
    const item = await studentTestimonialDao.getStudentTestimonialById(req.params.id);
    if (!item) {
      return error(res, 404, "Student testimonial not found");
    }
    return ok(res, "Student testimonial fetched successfully", item);
  } catch (err) {
    console.error("Get student testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateStudentTestimonial = async (req, res) => {
  try {
    const existing = await studentTestimonialDao.getStudentTestimonialById(req.params.id);
    if (!existing) {
      return error(res, 404, "Student testimonial not found");
    }

    const updateData = {};
    if (req.body.title !== undefined) {
      if (!req.body.title.trim()) {
        return error(res, 400, "Title is required", { code: "MISSING_FIELDS" });
      }
      updateData.title = req.body.title.trim();
    }
    if (req.body.position !== undefined) {
      if (!req.body.position.trim()) {
        return error(res, 400, "Position is required", { code: "MISSING_FIELDS" });
      }
      updateData.position = req.body.position.trim();
    }
    if (req.body.description !== undefined) {
      if (!req.body.description.trim()) {
        return error(res, 400, "Description is required", { code: "MISSING_FIELDS" });
      }
      updateData.description = req.body.description.trim();
    }
    if (req.file) {
      updateData.image_url = req.file.location;
      updateData.image_key = req.file.key;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await studentTestimonialDao.updateStudentTestimonial(req.params.id, updateData);

    if (req.file && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old student testimonial image from S3:", s3Err);
      }
    }

    return ok(res, "Student testimonial updated successfully");
  } catch (err) {
    console.error("Update student testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteStudentTestimonial = async (req, res) => {
  try {
    const result = await studentTestimonialDao.deleteStudentTestimonial(req.params.id);
    if (!result) {
      return error(res, 404, "Student testimonial not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting student testimonial image from S3:", s3Err);
    }

    return ok(res, "Student testimonial deleted successfully");
  } catch (err) {
    console.error("Delete student testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createStudentTestimonial,
  getAllStudentTestimonials,
  getStudentTestimonialById,
  updateStudentTestimonial,
  deleteStudentTestimonial,
};
