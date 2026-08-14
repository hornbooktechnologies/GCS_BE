const bioMedicalWasteDao = require("../dao/bioMedicalWasteDao");
const { ok, created, error } = require("../utils/responseHandler");

const parseYear = (value) => {
  const year = Number.parseInt(value, 10);
  const maxYear = new Date().getFullYear() + 1;
  return Number.isInteger(year) && year >= 2000 && year <= maxYear ? year : null;
};

const parseMonth = (value) => {
  const month = Number.parseInt(value, 10);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null;
};

const parseWeight = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const weight = Number(value);
  return Number.isFinite(weight) && weight >= 0 && weight <= 999999999.999
    ? Math.round(weight * 1000) / 1000
    : null;
};

const validatePayload = (body) => {
  const reportYear = parseYear(body.report_year);
  const reportMonth = parseMonth(body.report_month);
  const weights = {
    red_kg: parseWeight(body.red_kg),
    yellow_kg: parseWeight(body.yellow_kg),
    blue_kg: parseWeight(body.blue_kg),
    white_kg: parseWeight(body.white_kg),
  };
  const status = body.status || "published";

  if (!reportYear) return { message: "A valid report year is required" };
  if (!reportMonth) return { message: "A valid report month is required" };
  if (Object.values(weights).some((value) => value === null)) {
    return { message: "All waste values must be valid non-negative numbers" };
  }
  if (!['draft', 'published'].includes(status)) {
    return { message: "Status must be draft or published" };
  }
  if (body.notes && String(body.notes).length > 1000) {
    return { message: "Notes cannot exceed 1000 characters" };
  }

  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return {
    data: {
      report_year: reportYear,
      report_month: reportMonth,
      ...weights,
      total_kg: Math.round(total * 1000) / 1000,
      status,
      notes: body.notes ? String(body.notes).trim() : null,
    },
  };
};

const handleDatabaseError = (res, err, action) => {
  if (err.code === "ER_DUP_ENTRY") {
    return error(res, 409, "A record already exists for this year and month", {
      code: "DUPLICATE_REPORT_MONTH",
    });
  }
  console.error(`${action} biomedical waste error:`, err);
  return error(res, 500, "Internal server error", { details: err.message });
};

const getPublicRecords = async (req, res) => {
  try {
    const year = req.query.year ? parseYear(req.query.year) : null;
    if (req.query.year && !year) return error(res, 400, "Invalid report year");
    const records = await bioMedicalWasteDao.getPublicRecords(year);
    return ok(res, "Biomedical waste records fetched successfully", { records });
  } catch (err) {
    return handleDatabaseError(res, err, "Get public");
  }
};

const getAdminRecords = async (req, res) => {
  try {
    const year = req.query.year ? parseYear(req.query.year) : null;
    const status = req.query.status || null;
    if (req.query.year && !year) return error(res, 400, "Invalid report year");
    if (status && !['draft', 'published'].includes(status)) {
      return error(res, 400, "Invalid report status");
    }
    const records = await bioMedicalWasteDao.getAdminRecords({ year, status });
    return ok(res, "Biomedical waste records fetched successfully", { records });
  } catch (err) {
    return handleDatabaseError(res, err, "Get admin");
  }
};

const getRecordById = async (req, res) => {
  try {
    const record = await bioMedicalWasteDao.getRecordById(req.params.id);
    if (!record) return error(res, 404, "Biomedical waste record not found");
    return ok(res, "Biomedical waste record fetched successfully", record);
  } catch (err) {
    return handleDatabaseError(res, err, "Get");
  }
};

const createRecord = async (req, res) => {
  const validation = validatePayload(req.body);
  if (!validation.data) {
    return error(res, 400, validation.message, { code: "INVALID_REPORT_DATA" });
  }
  try {
    const record = await bioMedicalWasteDao.createRecord({
      ...validation.data,
      created_by: req.user?.id || null,
    });
    return created(res, "Biomedical waste record created successfully", record);
  } catch (err) {
    return handleDatabaseError(res, err, "Create");
  }
};

const updateRecord = async (req, res) => {
  const validation = validatePayload(req.body);
  if (!validation.data) {
    return error(res, 400, validation.message, { code: "INVALID_REPORT_DATA" });
  }
  try {
    const existing = await bioMedicalWasteDao.getRecordById(req.params.id);
    if (!existing) return error(res, 404, "Biomedical waste record not found");
    const record = await bioMedicalWasteDao.updateRecord(req.params.id, validation.data);
    return ok(res, "Biomedical waste record updated successfully", record);
  } catch (err) {
    return handleDatabaseError(res, err, "Update");
  }
};

const deleteRecord = async (req, res) => {
  try {
    const removed = await bioMedicalWasteDao.deleteRecord(req.params.id);
    if (!removed) return error(res, 404, "Biomedical waste record not found");
    return ok(res, "Biomedical waste record deleted successfully");
  } catch (err) {
    return handleDatabaseError(res, err, "Delete");
  }
};

module.exports = {
  getPublicRecords,
  getAdminRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
};

