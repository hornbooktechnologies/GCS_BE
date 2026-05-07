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

const imageFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
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

  cb(new Error("Only image files (JPG, PNG, GIF, WebP) are allowed"));
};

const newsUpload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const timestamp = Date.now().toString();
      const fileName = `${timestamp}-${file.originalname}`;

      if (file.fieldname === "thumbnail_image") {
        cb(null, `news/thumbnails/${fileName}`);
      } else if (file.fieldname === "detail_image") {
        cb(null, `news/details/${fileName}`);
      } else {
        // Default for backward compatibility
        cb(null, `news/${fileName}`);
      }
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail_image" || file.fieldname === "detail_image") {
      imageFilter(req, file, cb);
    } else {
      cb(new Error("Invalid field name. Use 'thumbnail_image' or 'detail_image'"));
    }
  },
});

module.exports = newsUpload;
