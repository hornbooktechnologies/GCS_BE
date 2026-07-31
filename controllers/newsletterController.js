const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { randomUUID } = require("crypto");
const path = require("path");
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

const NEWSLETTER_UPLOAD_LIMIT_MB = Number(
  process.env.NEWSLETTER_UPLOAD_LIMIT_MB || 100,
);
const NEWSLETTER_UPLOAD_LIMIT_BYTES =
  NEWSLETTER_UPLOAD_LIMIT_MB * 1024 * 1024;
const NEWSLETTER_UPLOAD_CACHE_CONTROL =
  "public, max-age=31536000, immutable";
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
]);

const encodeS3Key = (key) =>
  key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const buildPublicS3Url = (key) => {
  const configuredBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(
    /\/+$/,
    "",
  );
  const baseUrl =
    configuredBaseUrl ||
    `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

  return `${baseUrl}/${encodeS3Key(key)}`;
};

const isAllowedNewsletterFile = (fieldName, contentType, extension) => {
  const isImage =
    ALLOWED_IMAGE_TYPES.has(contentType) &&
    ALLOWED_IMAGE_EXTENSIONS.has(extension);

  if (fieldName === "photo") {
    return isImage;
  }

  return (
    fieldName === "attachment" &&
    (isImage || (contentType === "application/pdf" && extension === ".pdf"))
  );
};

const resolveNewsletterFile = (req, fieldName) => {
  const multipartFile = req.files?.[fieldName]?.[0];
  if (multipartFile) {
    return { file: multipartFile };
  }

  const key = req.body?.[`${fieldName}_key`];
  const contentType = req.body?.[`${fieldName}_content_type`];
  if (!key && !contentType) {
    return { file: null };
  }

  const extension = path.extname(key || "").toLowerCase();
  if (
    typeof key !== "string" ||
    !key.startsWith("newsletters/") ||
    !isAllowedNewsletterFile(fieldName, contentType, extension)
  ) {
    return {
      error: `Invalid direct-upload metadata for newsletter ${fieldName}.`,
    };
  }

  return {
    file: {
      key,
      location: buildPublicS3Url(key),
      mimetype: contentType,
    },
  };
};

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

const createNewsletterUploadPolicy = async (req, res) => {
  try {
    const { field_name: fieldName, file_name: fileName, content_type: contentType } =
      req.body;
    const fileSize = Number(req.body.file_size);
    const extension = path.extname(fileName || "").toLowerCase();

    if (!["photo", "attachment"].includes(fieldName)) {
      return error(res, 400, "Invalid newsletter upload field", {
        code: "INVALID_UPLOAD_FIELD",
      });
    }

    if (!isAllowedNewsletterFile(fieldName, contentType, extension)) {
      return error(res, 400, "Unsupported newsletter file type", {
        code: "INVALID_FILE_TYPE",
      });
    }

    if (
      !Number.isSafeInteger(fileSize) ||
      fileSize < 1 ||
      fileSize > NEWSLETTER_UPLOAD_LIMIT_BYTES
    ) {
      return error(
        res,
        400,
        `Newsletter files must be ${NEWSLETTER_UPLOAD_LIMIT_MB}MB or smaller.`,
        { code: "FILE_TOO_LARGE" },
      );
    }

    const key = `newsletters/${Date.now().toString()}-${randomUUID()}${extension}`;
    const uploadPolicy = await createPresignedPost(s3, {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Conditions: [
        ["content-length-range", 1, NEWSLETTER_UPLOAD_LIMIT_BYTES],
        ["eq", "$Content-Type", contentType],
        ["eq", "$Cache-Control", NEWSLETTER_UPLOAD_CACHE_CONTROL],
        ["eq", "$success_action_status", "204"],
      ],
      Fields: {
        "Content-Type": contentType,
        "Cache-Control": NEWSLETTER_UPLOAD_CACHE_CONTROL,
        success_action_status: "204",
      },
      Expires: 600,
    });

    return ok(res, "Newsletter upload policy created", {
      upload_url: uploadPolicy.url,
      upload_fields: uploadPolicy.fields,
      key,
      public_url: buildPublicS3Url(key),
      content_type: contentType,
      max_size_mb: NEWSLETTER_UPLOAD_LIMIT_MB,
    });
  } catch (err) {
    console.error("Create newsletter upload policy error:", err);
    return error(res, 500, "Unable to authorize newsletter upload", {
      details: err.message,
    });
  }
};

const createNewsletter = async (req, res) => {
  try {
    const { title, year } = req.body;
    const photoResult = resolveNewsletterFile(req, "photo");
    const attachmentResult = resolveNewsletterFile(req, "attachment");

    if (photoResult.error || attachmentResult.error) {
      return error(
        res,
        400,
        photoResult.error || attachmentResult.error,
        { code: "INVALID_UPLOAD_METADATA" },
      );
    }

    const photo = photoResult.file;
    const attachment = attachmentResult.file;

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
    const photoResult = resolveNewsletterFile(req, "photo");
    const attachmentResult = resolveNewsletterFile(req, "attachment");

    if (photoResult.error || attachmentResult.error) {
      return error(
        res,
        400,
        photoResult.error || attachmentResult.error,
        { code: "INVALID_UPLOAD_METADATA" },
      );
    }

    const photo = photoResult.file;
    const attachment = attachmentResult.file;

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
  createNewsletterUploadPolicy,
  createNewsletter,
  getAllNewsletters,
  getNewsletterById,
  updateNewsletter,
  deleteNewsletter,
};
