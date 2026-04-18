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

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

const specialityUpload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, `specialities/${fileName}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === "top_banner" || file.fieldname === "main_banners") {
      if (IMAGE_TYPES.includes(file.mimetype) && IMAGE_EXTENSIONS.includes(extension)) {
        return cb(null, true);
      }
      return cb(new Error("Top banner and main banners must be image files."));
    }

    if (file.fieldname === "brochure") {
      const isPdf = file.mimetype === "application/pdf" && extension === ".pdf";
      const isImage = IMAGE_TYPES.includes(file.mimetype) && IMAGE_EXTENSIONS.includes(extension);

      if (isPdf || isImage) {
        return cb(null, true);
      }

      return cb(new Error("Brochure must be a PDF or image file."));
    }

    return cb(new Error("Unsupported upload field."));
  },
});

module.exports = specialityUpload;
