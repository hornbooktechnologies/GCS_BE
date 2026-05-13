const governmentSchemeDao = require("../dao/governmentSchemeDao");
const { ok, created, error } = require("../utils/responseHandler");

const normalizeList = (rawValue) => {
  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof rawValue === "string" && rawValue.trim()) {
    try {
      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (parseError) {
      return rawValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const parseOptionalInt = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildSchemePayload = (body, { isCreate = false } = {}) => {
  const payload = {};

  if (body.scheme_name !== undefined || isCreate) {
    const schemeName = String(body.scheme_name || "").trim();
    if (!schemeName) {
      return { error: "Scheme name is required" };
    }
    payload.scheme_name = schemeName;
  }

  ["badge_text", "description", "cash_less_cover"].forEach((field) => {
    if (body[field] !== undefined) {
      const value = String(body[field] || "").trim();
      payload[field] = value || null;
    }
  });

  ["required_documents", "free_opd_specialities", "empanelled_specialities"].forEach((field) => {
    if (body[field] !== undefined || isCreate) {
      payload[field] = normalizeList(body[field]);
    }
  });

  ["opd_visits", "ipd_admissions", "dialysis_count", "chemo_count", "display_order"].forEach((field) => {
    if (body[field] !== undefined || (isCreate && field === "display_order")) {
      payload[field] = parseOptionalInt(body[field]) ?? (field === "display_order" ? 0 : null);
    }
  });

  return { payload };
};

const getAllSchemes = async (req, res) => {
  try {
    const schemes = await governmentSchemeDao.getAllSchemes();
    return ok(res, "Government schemes fetched successfully", { schemes });
  } catch (err) {
    console.error("Get government schemes error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getSchemeById = async (req, res) => {
  try {
    const scheme = await governmentSchemeDao.getSchemeById(req.params.id);
    if (!scheme) {
      return error(res, 404, "Government scheme not found");
    }
    return ok(res, "Government scheme fetched successfully", scheme);
  } catch (err) {
    console.error("Get government scheme error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const createScheme = async (req, res) => {
  try {
    const { payload, error: validationError } = buildSchemePayload(req.body, { isCreate: true });
    if (validationError) {
      return error(res, 400, validationError, { code: "MISSING_FIELDS" });
    }

    const scheme = await governmentSchemeDao.createScheme({
      ...payload,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Government scheme created successfully", scheme);
  } catch (err) {
    console.error("Create government scheme error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateScheme = async (req, res) => {
  try {
    const existing = await governmentSchemeDao.getSchemeById(req.params.id);
    if (!existing) {
      return error(res, 404, "Government scheme not found");
    }

    const { payload, error: validationError } = buildSchemePayload(req.body);
    if (validationError) {
      return error(res, 400, validationError, { code: "MISSING_FIELDS" });
    }

    if (Object.keys(payload).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    const scheme = await governmentSchemeDao.updateScheme(req.params.id, payload);
    return ok(res, "Government scheme updated successfully", scheme);
  } catch (err) {
    console.error("Update government scheme error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteScheme = async (req, res) => {
  try {
    const deleted = await governmentSchemeDao.deleteScheme(req.params.id);
    if (!deleted) {
      return error(res, 404, "Government scheme not found");
    }

    return ok(res, "Government scheme deleted successfully");
  } catch (err) {
    console.error("Delete government scheme error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  getAllSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
};
