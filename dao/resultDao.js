const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_results";

const createResult = async (data) => {
  const id = uuidv4();
  const { title, pdf_url, pdf_key, year, created_by } = data;

  await pool.query(
    `INSERT INTO ${TABLE_NAME} (id, title, pdf_url, pdf_key, year, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, title, pdf_url, pdf_key, year, created_by || null],
  );

  return { id, title, pdf_url, pdf_key, year, created_by: created_by || null };
};

const getAllResults = async () => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} ORDER BY year DESC, created_at DESC`);
  return rows;
};

const getResultById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return rows[0] || null;
};

const updateResult = async (id, data) => {
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(data);
  const [result] = await pool.query(`UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`, [...values, id]);
  return result.affectedRows > 0;
};

const deleteResult = async (id) => {
  const [rows] = await pool.query(`SELECT pdf_key FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  if (result.affectedRows > 0) {
    return { pdfKey: rows[0].pdf_key };
  }
  return null;
};

module.exports = {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
};
