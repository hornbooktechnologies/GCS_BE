const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const newsletterDao = require("../dao/newsletterDao");
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

const resolveAttachmentType = (file) =>
  file.mimetype === "application/pdf" ? "pdf" : "image";

const createNewsletter = async (req, res) => {
  try {
    const { title, year } = req.body;
    const photo = req.files?.photo?.[0];
    const attachment = req.files?.attachment?.[0];

    if (!title || !year) {
      return error(res, 400, "Title and year are required", {
        code: "MISSING_FIELDS",
      });
    }

    if (!photo || !attachment) {
      return error(res, 400, "Photo and attachment are required", {
        code: "MISSING_FILE",
      });
    }

    const newsletter = await newsletterDao.createNewsletter({
      title,
      photo_url: photo.location,
      photo_key: photo.key,
      attachment_url: attachment.location,
      attachment_key: attachment.key,
      attachment_type: resolveAttachmentType(attachment),
      year,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Newsletter created successfully", newsletter);
  } catch (err) {
    console.error("Create newsletter error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllNewsletters = async (req, res) => {
  try {
    const newsletters = await newsletterDao.getAllNewsletters();
    return ok(res, "Newsletters fetched successfully", { newsletters });
  } catch (err) {
    console.error("Get newsletters error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getNewsletterById = async (req, res) => {
  try {
    const newsletter = await newsletterDao.getNewsletterById(req.params.id);
    if (!newsletter) {
      return error(res, 404, "Newsletter not found");
    }
    return ok(res, "Newsletter fetched successfully", newsletter);
  } catch (err) {
    console.error("Get newsletter error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, year } = req.body;
    const photo = req.files?.photo?.[0];
    const attachment = req.files?.attachment?.[0];

    const existing = await newsletterDao.getNewsletterById(id);
    if (!existing) {
      return error(res, 404, "Newsletter not found");
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (year !== undefined) updateData.year = year;

    if (photo) {
      updateData.photo_url = photo.location;
      updateData.photo_key = photo.key;
    }

    if (attachment) {
      updateData.attachment_url = attachment.location;
      updateData.attachment_key = attachment.key;
      updateData.attachment_type = resolveAttachmentType(attachment);
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await newsletterDao.updateNewsletter(id, updateData);

    if (photo && existing.photo_key) {
      try {
        await deleteS3Object(existing.photo_key);
      } catch (s3Err) {
        console.error("Error deleting old newsletter photo from S3:", s3Err);
      }
    }

    if (attachment && existing.attachment_key) {
      try {
        await deleteS3Object(existing.attachment_key);
      } catch (s3Err) {
        console.error("Error deleting old newsletter attachment from S3:", s3Err);
      }
    }

    return ok(res, "Newsletter updated successfully");
  } catch (err) {
    console.error("Update newsletter error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteNewsletter = async (req, res) => {
  try {
    const result = await newsletterDao.deleteNewsletter(req.params.id);
    if (!result) {
      return error(res, 404, "Newsletter not found");
    }

    try {
      await deleteS3Object(result.photoKey);
    } catch (s3Err) {
      console.error("Error deleting newsletter photo from S3:", s3Err);
    }

    try {
      await deleteS3Object(result.attachmentKey);
    } catch (s3Err) {
      console.error("Error deleting newsletter attachment from S3:", s3Err);
    }

    return ok(res, "Newsletter deleted successfully");
  } catch (err) {
    console.error("Delete newsletter error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createNewsletter,
  getAllNewsletters,
  getNewsletterById,
  updateNewsletter,
  deleteNewsletter,
};
