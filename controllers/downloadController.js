const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const downloadDao = require("../dao/downloadDao");
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

const createDownload = async (req, res) => {
  try {
    const { title } = req.body;
    const image = req.files?.image?.[0];
    const pdf = req.files?.pdf?.[0];

    if (!title || !image || !pdf) {
      return error(res, 400, "Title, image, and PDF are required", {
        code: "MISSING_FIELDS",
      });
    }

    const download = await downloadDao.createDownload({
      title,
      image_url: image.location,
      image_key: image.key,
      pdf_url: pdf.location,
      pdf_key: pdf.key,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Download created successfully", download);
  } catch (err) {
    console.error("Create download error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllDownloads = async (req, res) => {
  try {
    const downloads = await downloadDao.getAllDownloads();
    return ok(res, "Downloads fetched successfully", { downloads });
  } catch (err) {
    console.error("Get downloads error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getDownloadById = async (req, res) => {
  try {
    const download = await downloadDao.getDownloadById(req.params.id);
    if (!download) {
      return error(res, 404, "Download not found");
    }
    return ok(res, "Download fetched successfully", download);
  } catch (err) {
    console.error("Get download error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const image = req.files?.image?.[0];
    const pdf = req.files?.pdf?.[0];
    const existing = await downloadDao.getDownloadById(id);

    if (!existing) {
      return error(res, 404, "Download not found");
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

    await downloadDao.updateDownload(id, updateData);

    if (image && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old download image from S3:", s3Err);
      }
    }

    if (pdf && existing.pdf_key) {
      try {
        await deleteS3Object(existing.pdf_key);
      } catch (s3Err) {
        console.error("Error deleting old download PDF from S3:", s3Err);
      }
    }

    return ok(res, "Download updated successfully");
  } catch (err) {
    console.error("Update download error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteDownload = async (req, res) => {
  try {
    const result = await downloadDao.deleteDownload(req.params.id);
    if (!result) {
      return error(res, 404, "Download not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting download image from S3:", s3Err);
    }

    try {
      await deleteS3Object(result.pdfKey);
    } catch (s3Err) {
      console.error("Error deleting download PDF from S3:", s3Err);
    }

    return ok(res, "Download deleted successfully");
  } catch (err) {
    console.error("Delete download error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createDownload,
  getAllDownloads,
  getDownloadById,
  updateDownload,
  deleteDownload,
};
