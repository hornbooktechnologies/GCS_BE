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
const RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];

const careerUpload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, `career/${fileName}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === "resume") {
      if (RESUME_TYPES.includes(file.mimetype) && RESUME_EXTENSIONS.includes(extension)) {
        return cb(null, true);
      }
      return cb(new Error("Resume must be a PDF, DOC, or DOCX file."));
    }

    if (file.fieldname === "image") {
      if (IMAGE_TYPES.includes(file.mimetype) && IMAGE_EXTENSIONS.includes(extension)) {
        return cb(null, true);
      }
      return cb(new Error("Image must be JPG, JPEG, PNG, GIF, or WEBP."));
    }

    if (file.fieldname === "pdf") {
      if (file.mimetype === "application/pdf" && extension === ".pdf") {
        return cb(null, true);
      }
      return cb(new Error("PDF field only accepts PDF files."));
    }

    cb(new Error("Unsupported upload field."));
  },
});

module.exports = careerUpload;
