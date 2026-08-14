const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_bio_medical_waste";

const createRecord = async (data) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO ${TABLE_NAME}
      (id, report_year, report_month, red_kg, yellow_kg, blue_kg, white_kg, total_kg, status, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.report_year,
      data.report_month,
      data.red_kg,
      data.yellow_kg,
      data.blue_kg,
      data.white_kg,
      data.total_kg,
      data.status,
      data.notes || null,
      data.created_by || null,
    ],
  );
  return getRecordById(id);
};

const getPublicRecords = async (year) => {
  const values = [];
  let where = "WHERE status = 'published'";
  if (year) {
    where += " AND report_year = ?";
    values.push(year);
  }

  const [rows] = await pool.query(
    `SELECT id, report_year, report_month, red_kg, yellow_kg, blue_kg,
            white_kg, total_kg, notes, updated_at
     FROM ${TABLE_NAME}
     ${where}
     ORDER BY report_year DESC, report_month ASC`,
    values,
  );
  return rows;
};

const getAdminRecords = async ({ year, status } = {}) => {
  const clauses = [];
  const values = [];
  if (year) {
    clauses.push("report_year = ?");
    values.push(year);
  }
  if (status) {
    clauses.push("status = ?");
    values.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME} ${where}
     ORDER BY report_year DESC, report_month DESC`,
    values,
  );
  return rows;
};

const getRecordById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return rows[0] || null;
};

const updateRecord = async (id, data) => {
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(data);
  const [result] = await pool.query(
    `UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`,
    [...values, id],
  );
  return result.affectedRows > 0 ? getRecordById(id) : null;
};

const deleteRecord = async (id) => {
  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  createRecord,
  getPublicRecords,
  getAdminRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};

