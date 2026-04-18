const healthCampDao = require("../dao/healthCampDao");
const { ok, created, error } = require("../utils/responseHandler");

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const validatePayload = ({ year, camps, no_of_patients }) => {
  const parsedYear = parsePositiveInteger(year);
  const parsedCamps = parsePositiveInteger(camps);
  const parsedPatients = parsePositiveInteger(no_of_patients);

  if (!parsedYear || parsedYear < 1900 || parsedYear > 2155) {
    return { message: "Valid year is required" };
  }
  if (parsedCamps === null || parsedCamps < 0) {
    return { message: "Valid camps value is required" };
  }
  if (parsedPatients === null || parsedPatients < 0) {
    return { message: "Valid number of patients is required" };
  }

  return {
    data: {
      year: parsedYear,
      camps: parsedCamps,
      no_of_patients: parsedPatients,
    },
  };
};

const createHealthCamp = async (req, res) => {
  try {
    const validation = validatePayload(req.body);
    if (!validation.data) {
      return error(res, 400, validation.message, { code: "MISSING_FIELDS" });
    }

    const item = await healthCampDao.createHealthCamp({
      ...validation.data,
      created_by: req.user ? req.user.id : null,
    });
    return created(res, "Health camp created successfully", item);
  } catch (err) {
    console.error("Create health camp error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllHealthCamps = async (req, res) => {
  try {
    const healthCamps = await healthCampDao.getAllHealthCamps();
    return ok(res, "Health camps fetched successfully", { healthCamps });
  } catch (err) {
    console.error("Get health camps error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getHealthCampById = async (req, res) => {
  try {
    const item = await healthCampDao.getHealthCampById(req.params.id);
    if (!item) {
      return error(res, 404, "Health camp not found");
    }
    return ok(res, "Health camp fetched successfully", item);
  } catch (err) {
    console.error("Get health camp error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateHealthCamp = async (req, res) => {
  try {
    const existing = await healthCampDao.getHealthCampById(req.params.id);
    if (!existing) {
      return error(res, 404, "Health camp not found");
    }

    const validation = validatePayload(req.body);
    if (!validation.data) {
      return error(res, 400, validation.message, { code: "MISSING_FIELDS" });
    }

    await healthCampDao.updateHealthCamp(req.params.id, validation.data);
    return ok(res, "Health camp updated successfully");
  } catch (err) {
    console.error("Update health camp error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteHealthCamp = async (req, res) => {
  try {
    const success = await healthCampDao.deleteHealthCamp(req.params.id);
    if (!success) {
      return error(res, 404, "Health camp not found");
    }
    return ok(res, "Health camp deleted successfully");
  } catch (err) {
    console.error("Delete health camp error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createHealthCamp,
  getAllHealthCamps,
  getHealthCampById,
  updateHealthCamp,
  deleteHealthCamp,
};
