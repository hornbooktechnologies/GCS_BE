const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const specialityDao = require("../dao/specialityDao");
const { ok, created, error } = require("../utils/responseHandler");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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

const resolveBrochureType = (file) =>
  file.mimetype === "application/pdf" ? "pdf" : "image";

const isMeaningfulHtml = (html) =>
  html && html.replace(/<(.|\n)*?>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;

const isValidCategory = (category) => ["general", "super"].includes(category);

const getAllSpecialities = async (req, res) => {
  try {
    const specialities = await specialityDao.getAllSpecialities();
    return ok(res, "Specialities fetched successfully", { specialities });
  } catch (err) {
    console.error("Get specialities error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getSpecialityById = async (req, res) => {
  try {
    const speciality = await specialityDao.getSpecialityById(req.params.id);
    if (!speciality) {
      return error(res, 404, "Speciality not found");
    }
    return ok(res, "Speciality fetched successfully", speciality);
  } catch (err) {
    console.error("Get speciality error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const createSpeciality = async (req, res) => {
  try {
    const { title, sub_description, category, description } = req.body;
    const topBanner = req.files?.top_banner?.[0];
    const mainBanners = req.files?.main_banners || [];
    const brochure = req.files?.brochure?.[0];

    if (!title || !sub_description || !category || !description) {
      return error(res, 400, "All speciality fields are required", {
        code: "MISSING_FIELDS",
      });
    }

    if (!isValidCategory(category)) {
      return error(res, 400, "Category must be general or super", {
        code: "INVALID_DATA",
      });
    }

    if (!isMeaningfulHtml(description)) {
      return error(res, 400, "Description is required", {
        code: "MISSING_FIELDS",
      });
    }

    if (!topBanner || !brochure) {
      return error(res, 400, "Top banner and brochure are required", {
        code: "MISSING_FILE",
      });
    }

    if (mainBanners.length === 0) {
      return error(res, 400, "At least one main banner is required", {
        code: "MISSING_FILE",
      });
    }

    const speciality = await specialityDao.createSpeciality({
      title: title.trim(),
      top_banner_url: topBanner.location,
      top_banner_key: topBanner.key,
      sub_description: sub_description.trim(),
      category,
      description,
      brochure_url: brochure.location,
      brochure_key: brochure.key,
      brochure_type: resolveBrochureType(brochure),
      created_by: req.user ? req.user.id : null,
      main_banners: mainBanners.map((file) => ({
        image_url: file.location,
        image_key: file.key,
      })),
    });

    return created(res, "Speciality created successfully", speciality);
  } catch (err) {
    console.error("Create speciality error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateSpeciality = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, sub_description, category, description } = req.body;
    const topBanner = req.files?.top_banner?.[0];
    const mainBanners = req.files?.main_banners || [];
    const brochure = req.files?.brochure?.[0];

    const existing = await specialityDao.getSpecialityById(id);
    if (!existing) {
      return error(res, 404, "Speciality not found");
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (sub_description !== undefined) updateData.sub_description = sub_description.trim();
    if (category !== undefined) {
      if (!isValidCategory(category)) {
        return error(res, 400, "Category must be general or super", {
          code: "INVALID_DATA",
        });
      }
      updateData.category = category;
    }
    if (description !== undefined) {
      if (!isMeaningfulHtml(description)) {
        return error(res, 400, "Description is required", {
          code: "MISSING_FIELDS",
        });
      }
      updateData.description = description;
    }

    if (topBanner) {
      updateData.top_banner_url = topBanner.location;
      updateData.top_banner_key = topBanner.key;
    }

    if (brochure) {
      updateData.brochure_url = brochure.location;
      updateData.brochure_key = brochure.key;
      updateData.brochure_type = resolveBrochureType(brochure);
    }

    if (mainBanners.length > 0) {
      updateData.main_banners = mainBanners.map((file) => ({
        image_url: file.location,
        image_key: file.key,
      }));
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    const speciality = await specialityDao.updateSpeciality(id, updateData);

    if (topBanner && existing.top_banner_key) {
      try {
        await deleteS3Object(existing.top_banner_key);
      } catch (s3Err) {
        console.error("Error deleting old speciality top banner from S3:", s3Err);
      }
    }

    if (brochure && existing.brochure_key) {
      try {
        await deleteS3Object(existing.brochure_key);
      } catch (s3Err) {
        console.error("Error deleting old speciality brochure from S3:", s3Err);
      }
    }

    if (mainBanners.length > 0) {
      for (const item of existing.main_banners) {
        try {
          await deleteS3Object(item.image_key);
        } catch (s3Err) {
          console.error("Error deleting old speciality main banner from S3:", s3Err);
        }
      }
    }

    return ok(res, "Speciality updated successfully", speciality);
  } catch (err) {
    console.error("Update speciality error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteSpeciality = async (req, res) => {
  try {
    const result = await specialityDao.deleteSpeciality(req.params.id);
    if (!result) {
      return error(res, 404, "Speciality not found");
    }

    try {
      await deleteS3Object(result.topBannerKey);
    } catch (s3Err) {
      console.error("Error deleting speciality top banner from S3:", s3Err);
    }

    try {
      await deleteS3Object(result.brochureKey);
    } catch (s3Err) {
      console.error("Error deleting speciality brochure from S3:", s3Err);
    }

    for (const key of result.mainBannerKeys) {
      try {
        await deleteS3Object(key);
      } catch (s3Err) {
        console.error("Error deleting speciality main banner from S3:", s3Err);
      }
    }

    return ok(res, "Speciality deleted successfully");
  } catch (err) {
    console.error("Delete speciality error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  getAllSpecialities,
  getSpecialityById,
  createSpeciality,
  updateSpeciality,
  deleteSpeciality,
};
