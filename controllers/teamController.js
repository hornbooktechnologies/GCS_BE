const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const teamDao = require("../dao/teamDao");
const teamCategoryDao = require("../dao/teamCategoryDao");
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
  if (!key) return;
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }),
  );
};

const createTeamMember = async (req, res) => {
  try {
    const { name, subtitle, description, category_id } = req.body;
    const image = req.file;

    if (!name || !subtitle || !description || !category_id || !image) {
      return error(res, 400, "All team fields are required", {
        code: "MISSING_FIELDS",
      });
    }

    const category = await teamCategoryDao.getTeamCategoryById(category_id);
    if (!category) {
      return error(res, 400, "Selected team category does not exist", {
        code: "INVALID_DATA",
      });
    }

    const member = await teamDao.createTeamMember({
      name,
      subtitle,
      description,
      category_id,
      image_url: image.location,
      image_key: image.key,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Team member created successfully", member);
  } catch (err) {
    console.error("Create team member error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllTeamMembers = async (req, res) => {
  try {
    const members = await teamDao.getAllTeamMembers();
    return ok(res, "Team members fetched successfully", { members });
  } catch (err) {
    console.error("Get team members error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getTeamMemberById = async (req, res) => {
  try {
    const member = await teamDao.getTeamMemberById(req.params.id);
    if (!member) {
      return error(res, 404, "Team member not found");
    }
    return ok(res, "Team member fetched successfully", member);
  } catch (err) {
    console.error("Get team member error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const { name, subtitle, description, category_id } = req.body;
    const image = req.file;
    const existing = await teamDao.getTeamMemberById(req.params.id);

    if (!existing) {
      return error(res, 404, "Team member not found");
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (description !== undefined) updateData.description = description;
    if (category_id !== undefined) {
      const category = await teamCategoryDao.getTeamCategoryById(category_id);
      if (!category) {
        return error(res, 400, "Selected team category does not exist", {
          code: "INVALID_DATA",
        });
      }
      updateData.category_id = category_id;
    }
    if (image) {
      updateData.image_url = image.location;
      updateData.image_key = image.key;
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await teamDao.updateTeamMember(req.params.id, updateData);

    if (image && existing.image_key) {
      try {
        await deleteS3Object(existing.image_key);
      } catch (s3Err) {
        console.error("Error deleting old team image from S3:", s3Err);
      }
    }

    return ok(res, "Team member updated successfully");
  } catch (err) {
    console.error("Update team member error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    const result = await teamDao.deleteTeamMember(req.params.id);
    if (!result) {
      return error(res, 404, "Team member not found");
    }

    try {
      await deleteS3Object(result.imageKey);
    } catch (s3Err) {
      console.error("Error deleting team image from S3:", s3Err);
    }

    return ok(res, "Team member deleted successfully");
  } catch (err) {
    console.error("Delete team member error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
};
