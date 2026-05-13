const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_government_schemes";

const JSON_FIELDS = ["required_documents", "free_opd_specialities", "empanelled_specialities"];

const parseJsonField = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
};

const normalizeScheme = (scheme) => {
  if (!scheme) {
    return null;
  }

  return {
    ...scheme,
    required_documents: parseJsonField(scheme.required_documents),
    free_opd_specialities: parseJsonField(scheme.free_opd_specialities),
    empanelled_specialities: parseJsonField(scheme.empanelled_specialities),
  };
};

const serializeData = (data) => {
  const serialized = { ...data };

  JSON_FIELDS.forEach((field) => {
    if (field in serialized) {
      serialized[field] = JSON.stringify(Array.isArray(serialized[field]) ? serialized[field] : []);
    }
  });

  return serialized;
};

const getAllSchemes = async () => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} ORDER BY display_order ASC, created_at DESC`);
  return rows.map(normalizeScheme);
};

const getSchemeById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return normalizeScheme(rows[0] || null);
};

const createScheme = async (data) => {
  const id = uuidv4();
  const scheme = serializeData({
    ...data,
    id,
    created_by: data.created_by || null,
  });

  await pool.query(
    `INSERT INTO ${TABLE_NAME}
      (id, scheme_name, badge_text, description, cash_less_cover, required_documents,
       opd_visits, ipd_admissions, dialysis_count, chemo_count, free_opd_specialities,
       empanelled_specialities, display_order, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      scheme.id,
      scheme.scheme_name,
      scheme.badge_text || null,
      scheme.description || null,
      scheme.cash_less_cover || null,
      scheme.required_documents,
      scheme.opd_visits ?? null,
      scheme.ipd_admissions ?? null,
      scheme.dialysis_count ?? null,
      scheme.chemo_count ?? null,
      scheme.free_opd_specialities,
      scheme.empanelled_specialities,
      scheme.display_order ?? 0,
      scheme.created_by,
    ],
  );

  return getSchemeById(id);
};

const updateScheme = async (id, data) => {
  const scheme = serializeData(data);
  const fieldEntries = Object.entries(scheme);

  if (fieldEntries.length === 0) {
    return getSchemeById(id);
  }

  const fields = fieldEntries.map(([key]) => `${key} = ?`).join(", ");
  const values = fieldEntries.map(([, value]) => value);

  const [result] = await pool.query(`UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`, [...values, id]);
  if (result.affectedRows === 0) {
    return null;
  }

  return getSchemeById(id);
};

const deleteScheme = async (id) => {
  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
};
