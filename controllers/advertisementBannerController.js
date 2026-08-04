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
    const banners = await advertisementBannerDao.getAdvertisementBanners();
    return ok(res, "Advertisement banners fetched successfully", {
      banners,
      banner: banners[0] || null,
      max_count: advertisementBannerDao.BANNER_SLOT_IDS.length,
    });
  } catch (err) {
    console.error("Get advertisement banner error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const upsertAdvertisementBanner = async (req, res) => {
  try {
    const { title, link_url } = req.body;
    const slotId = Number(req.params.id || req.body.id || 1);

    if (!advertisementBannerDao.BANNER_SLOT_IDS.includes(slotId)) {
      return error(res, 400, "Advertisement banner slot must be 1 or 2", {
        code: "INVALID_BANNER_SLOT",
      });
    }

    const existing = await advertisementBannerDao.getAdvertisementBannerById(slotId);

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

    const banner = await advertisementBannerDao.upsertAdvertisementBanner(
      updateData,
      slotId,
    );

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

    const banners = await advertisementBannerDao.getAdvertisementBanners();
    return ok(res, `Advertisement banner ${slotId} saved successfully`, {
      banner,
      banners,
      max_count: advertisementBannerDao.BANNER_SLOT_IDS.length,
    });
  } catch (err) {
    console.error("Save advertisement banner error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteAdvertisementBanner = async (req, res) => {
  try {
    const slotId = Number(req.params.id);

    if (!advertisementBannerDao.BANNER_SLOT_IDS.includes(slotId)) {
      return error(res, 400, "Advertisement banner slot must be 1 or 2", {
        code: "INVALID_BANNER_SLOT",
      });
    }

    const deletedBanner = await advertisementBannerDao.deleteAdvertisementBanner(slotId);
    if (!deletedBanner) {
      return error(res, 404, `Advertisement banner ${slotId} not found`, {
        code: "BANNER_NOT_FOUND",
      });
    }

    if (deletedBanner.image_key) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: deletedBanner.image_key,
          }),
        );
      } catch (s3Err) {
        console.error(
          "Error deleting advertisement banner image from S3:",
          s3Err,
        );
      }
    }

    const banners = await advertisementBannerDao.getAdvertisementBanners();
    return ok(res, `Advertisement banner ${slotId} removed successfully`, {
      deleted_id: slotId,
      banners,
      banner: banners[0] || null,
      max_count: advertisementBannerDao.BANNER_SLOT_IDS.length,
    });
  } catch (err) {
    console.error("Delete advertisement banner error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  getAdvertisementBanner,
  upsertAdvertisementBanner,
  deleteAdvertisementBanner,
};
