const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const advertisementBannerDao = require("../dao/advertisementBannerDao");
const { ok, error } = require("../utils/responseHandler");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getAdvertisementBanner = async (req, res) => {
  try {
    const banner = await advertisementBannerDao.getAdvertisementBanner();
    return ok(res, "Advertisement banner fetched successfully", { banner });
  } catch (err) {
    console.error("Get advertisement banner error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const upsertAdvertisementBanner = async (req, res) => {
  try {
    const { title, link_url } = req.body;
    const existing = await advertisementBannerDao.getAdvertisementBanner();

    if (!title || !title.trim()) {
      return error(res, 400, "Advertisement banner title is required", {
        code: "MISSING_FIELDS",
      });
    }

    if (!existing && !req.file) {
      return error(res, 400, "Advertisement banner image is required", {
        code: "MISSING_IMAGE",
      });
    }

    const updateData = {
      title: title.trim(),
      link_url: link_url ? link_url.trim() : null,
    };

    if (!existing) {
      updateData.created_by = req.user ? req.user.id : null;
    }

    if (req.file) {
      updateData.image_url = req.file.location;
      updateData.image_key = req.file.key;
    }

    const banner = await advertisementBannerDao.upsertAdvertisementBanner(updateData);

    if (req.file && existing?.image_key) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: existing.image_key,
          }),
        );
      } catch (s3Err) {
        console.error(
          "Error deleting old advertisement banner image from S3:",
          s3Err,
        );
      }
    }

    return ok(res, "Advertisement banner saved successfully", { banner });
  } catch (err) {
    console.error("Save advertisement banner error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  getAdvertisementBanner,
  upsertAdvertisementBanner,
};
