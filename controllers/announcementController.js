const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const announcementDao = require("../dao/announcementDao");
const { ok, created, error } = require("../utils/responseHandler");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const createAnnouncement = async (req, res) => {
  try {
    const { title, url, is_new } = req.body;
    const pdfFile = req.files?.pdf?.[0];
    const imageFile = req.files?.image?.[0];

    if (!title) {
      return error(res, 400, "Announcement title is required", {
        code: "MISSING_FIELDS",
      });
    }

    if (pdfFile && imageFile) {
      return error(res, 400, "Upload either a PDF or an image, not both", {
        code: "INVALID_FILE_COMBINATION",
      });
    }

    if (!pdfFile && !imageFile) {
      return error(res, 400, "Announcement attachment is required", {
        code: "MISSING_FILE",
      });
    }

    const announcement = await announcementDao.createAnnouncement({
      title,
      is_new:
        is_new === true || is_new === "true" || is_new === 1 || is_new === "1",
      url: url || null,
      pdf_url: pdfFile.location,
      pdf_key: pdfFile.key,
      image_url: imageFile ? imageFile.location : null,
      image_key: imageFile ? imageFile.key : null,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Announcement created successfully", announcement);
  } catch (err) {
    console.error("Create announcement error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementDao.getAllAnnouncements();
    return ok(res, "Announcements fetched successfully", { announcements });
  } catch (err) {
    console.error("Get announcements error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await announcementDao.getAnnouncementById(req.params.id);
    if (!announcement) {
      return error(res, 404, "Announcement not found");
    }
    return ok(res, "Announcement fetched successfully", announcement);
  } catch (err) {
    console.error("Get announcement error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, is_new } = req.body;
    const pdfFile = req.files?.pdf?.[0];
    const imageFile = req.files?.image?.[0];

    const existing = await announcementDao.getAnnouncementById(id);
    if (!existing) {
      return error(res, 404, "Announcement not found");
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (url !== undefined) updateData.url = url || null;
    if (is_new !== undefined) {
      updateData.is_new =
        is_new === true || is_new === "true" || is_new === 1 || is_new === "1"
          ? 1
          : 0;
    }

    if (pdfFile && imageFile) {
      return error(res, 400, "Upload either a PDF or an image, not both", {
        code: "INVALID_FILE_COMBINATION",
      });
    }

    if (pdfFile) {
      updateData.pdf_url = pdfFile.location;
      updateData.pdf_key = pdfFile.key;
      updateData.image_url = null;
      updateData.image_key = null;

      if (existing.pdf_key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: existing.pdf_key,
            }),
          );
        } catch (s3Err) {
          console.error("Error deleting old announcement PDF from S3:", s3Err);
        }
      }

      if (existing.image_key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: existing.image_key,
            }),
          );
        } catch (s3Err) {
          console.error("Error deleting old announcement image from S3:", s3Err);
        }
      }
    }

    if (imageFile) {
      updateData.image_url = imageFile.location;
      updateData.image_key = imageFile.key;
      updateData.pdf_url = null;
      updateData.pdf_key = null;

      if (existing.image_key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: existing.image_key,
            }),
          );
        } catch (s3Err) {
          console.error("Error deleting old announcement image from S3:", s3Err);
        }
      }

      if (existing.pdf_key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: existing.pdf_key,
            }),
          );
        } catch (s3Err) {
          console.error("Error deleting old announcement PDF from S3:", s3Err);
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await announcementDao.updateAnnouncement(id, updateData);
    return ok(res, "Announcement updated successfully");
  } catch (err) {
    console.error("Update announcement error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const result = await announcementDao.deleteAnnouncement(req.params.id);
    if (!result) {
      return error(res, 404, "Announcement not found");
    }

    try {
      if (result.pdfKey) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: result.pdfKey,
          }),
        );
      }
    } catch (s3Err) {
      console.error("Error deleting announcement PDF from S3:", s3Err);
    }

    try {
      if (result.imageKey) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: result.imageKey,
          }),
        );
      }
    } catch (s3Err) {
      console.error("Error deleting announcement image from S3:", s3Err);
    }

    return ok(res, "Announcement deleted successfully");
  } catch (err) {
    console.error("Delete announcement error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const reorderAnnouncements = async (req, res) => {
  try {
    const { orderedItems } = req.body;
    if (!Array.isArray(orderedItems) || orderedItems.length === 0) {
      return error(res, 400, "orderedItems array is required", {
        code: "MISSING_FIELDS",
      });
    }

    for (const item of orderedItems) {
      if (!item.id || item.display_order === undefined) {
        return error(res, 400, "Each item must have 'id' and 'display_order'", {
          code: "INVALID_DATA",
        });
      }
    }

    await announcementDao.updateAnnouncementOrder(orderedItems);
    return ok(res, "Announcement order updated successfully");
  } catch (err) {
    console.error("Reorder announcements error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  reorderAnnouncements,
};
