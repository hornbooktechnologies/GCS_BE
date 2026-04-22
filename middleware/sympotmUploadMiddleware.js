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

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

const sympotmUpload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, `sympotms/${fileName}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      file.fieldname === "image"
      && ALLOWED_IMAGE_TYPES.includes(file.mimetype)
      && ALLOWED_IMAGE_EXTENSIONS.includes(extension)
    ) {
      return cb(null, true);
    }

    return cb(new Error("Only image files are allowed for the image field."));
  },
});

module.exports = sympotmUpload;
