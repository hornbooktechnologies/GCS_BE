const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const announcementUpload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, `announcements/${fileName}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === "pdf") {
      const isPdf = file.mimetype === "application/pdf" && extension === ".pdf";
      if (isPdf) {
        return cb(null, true);
      }

      return cb(new Error("Only PDF files are allowed for the PDF field."));
    }

    if (file.fieldname === "image") {
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

      if (
        allowedImageTypes.includes(file.mimetype) &&
        allowedImageExtensions.includes(extension)
      ) {
        return cb(null, true);
      }

      return cb(
        new Error(
          "Only image files are allowed for the image field (jpg, jpeg, png, gif, webp).",
        ),
      );
    }

    cb(new Error("Unsupported upload field."));
  },
});

module.exports = announcementUpload;
