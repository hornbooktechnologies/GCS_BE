const bannerDao = require("../dao/bannerDao");
const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { ok, created, error } = require("../utils/responseHandler");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create a new banner
const createBanner = async (req, res) => {
  try {
    const { title, link_url, status } = req.body;

    if (!title) {
      return error(res, 400, "Banner title is required", {
        code: "MISSING_FIELDS",
      });
    }

    if (!req.file) {
      return error(res, 400, "Banner image is required", {
        code: "MISSING_IMAGE",
      });
    }

    const bannerData = {
      title,
      image_url: req.file.location,
      image_key: req.file.key,
      link_url: link_url || null,
      status: status || "active",
      created_by: req.user ? req.user.id : null,
    };

    const newBanner = await bannerDao.createBanner(bannerData);
    return created(res, "Banner created successfully", newBanner);
  } catch (err) {
    console.error("Create banner error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

// Get all banners
const getAllBanners = async (req, res) => {
  try {
    const includeInactive = req.query.all === "true";
    const banners = await bannerDao.getAllBanners(includeInactive);
    return ok(res, "Banners fetched successfully", { banners });
  } catch (err) {
    console.error("Get banners error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

// Get banner by ID
const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await bannerDao.getBannerById(id);
    if (!banner) {
      return error(res, 404, "Banner not found");
    }
    return ok(res, "Banner fetched successfully", banner);
  } catch (err) {
    console.error("Get banner error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

// Update a banner
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link_url, status } = req.body;

    const existing = await bannerDao.getBannerById(id);
    if (!existing) {
      return error(res, 404, "Banner not found");
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (link_url !== undefined) updateData.link_url = link_url;
    if (status !== undefined) updateData.status = status;

    // If a new image is uploaded, update image and delete old one from S3
    if (req.file) {
      updateData.image_url = req.file.location;
      updateData.image_key = req.file.key;

      // Delete old image from S3
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: existing.image_key,
          })
        );
      } catch (s3Err) {
        console.error("Error deleting old banner image from S3:", s3Err);
        // Don't fail the update if S3 delete fails
      }
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", {
        code: "NO_UPDATE_DATA",
      });
    }

    const success = await bannerDao.updateBanner(id, updateData);
    if (!success) {
      return error(res, 404, "Banner not found");
    }

    return ok(res, "Banner updated successfully");
  } catch (err) {
    console.error("Update banner error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

// Delete a banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await bannerDao.deleteBanner(id);

    if (!result) {
      return error(res, 404, "Banner not found");
    }

    // Delete image from S3
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: result.imageKey,
        })
      );
    } catch (s3Err) {
      console.error("Error deleting banner image from S3:", s3Err);
      // Don't fail the response if S3 delete fails
    }

    return ok(res, "Banner deleted successfully");
  } catch (err) {
    console.error("Delete banner error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

// Reorder banners (drag and drop)
const reorderBanners = async (req, res) => {
  try {
    const { orderedItems } = req.body;

    if (!orderedItems || !Array.isArray(orderedItems) || orderedItems.length === 0) {
      return error(res, 400, "orderedItems array is required", {
        code: "MISSING_FIELDS",
      });
    }

    // Validate each item has id and display_order
    for (const item of orderedItems) {
      if (!item.id || item.display_order === undefined) {
        return error(res, 400, "Each item must have 'id' and 'display_order'", {
          code: "INVALID_DATA",
        });
      }
    }

    await bannerDao.updateBannerOrder(orderedItems);
    return ok(res, "Banner order updated successfully");
  } catch (err) {
    console.error("Reorder banners error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  reorderBanners,
};
