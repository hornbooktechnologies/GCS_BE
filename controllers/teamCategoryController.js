const teamCategoryDao = require("../dao/teamCategoryDao");
const { ok, created, error } = require("../utils/responseHandler");

const createTeamCategory = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return error(res, 400, "Title is required", { code: "MISSING_FIELDS" });
    }

    const item = await teamCategoryDao.createTeamCategory({
      title: title.trim(),
      created_by: req.user ? req.user.id : null,
    });
    return created(res, "Team category created successfully", item);
  } catch (err) {
    console.error("Create team category error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllTeamCategories = async (req, res) => {
  try {
    const categories = await teamCategoryDao.getAllTeamCategories();
    return ok(res, "Team categories fetched successfully", { categories });
  } catch (err) {
    console.error("Get team categories error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getTeamCategoryById = async (req, res) => {
  try {
    const item = await teamCategoryDao.getTeamCategoryById(req.params.id);
    if (!item) {
      return error(res, 404, "Team category not found");
    }
    return ok(res, "Team category fetched successfully", item);
  } catch (err) {
    console.error("Get team category error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateTeamCategory = async (req, res) => {
  try {
    const { title } = req.body;
    const item = await teamCategoryDao.getTeamCategoryById(req.params.id);
    if (!item) {
      return error(res, 404, "Team category not found");
    }
    if (!title || !title.trim()) {
      return error(res, 400, "Title is required", { code: "MISSING_FIELDS" });
    }

    await teamCategoryDao.updateTeamCategory(req.params.id, { title: title.trim() });
    return ok(res, "Team category updated successfully");
  } catch (err) {
    console.error("Update team category error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteTeamCategory = async (req, res) => {
  try {
    const success = await teamCategoryDao.deleteTeamCategory(req.params.id);
    if (!success) {
      return error(res, 404, "Team category not found");
    }
    return ok(res, "Team category deleted successfully");
  } catch (err) {
    console.error("Delete team category error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createTeamCategory,
  getAllTeamCategories,
  getTeamCategoryById,
  updateTeamCategory,
  deleteTeamCategory,
};
