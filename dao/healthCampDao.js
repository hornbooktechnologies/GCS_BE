const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_health_camps";

const createHealthCamp = async (data) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO ${TABLE_NAME} (id, year, camps, no_of_patients, created_by) VALUES (?, ?, ?, ?, ?)`,
    [id, data.year, data.camps, data.no_of_patients, data.created_by || null],
  );
  return { id, ...data };
};

const getAllHealthCamps = async () => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} ORDER BY year DESC, created_at DESC`);
  return rows;
};

const getHealthCampById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return rows[0];
};

const updateHealthCamp = async (id, data) => {
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(data);
  const [result] = await pool.query(`UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`, [...values, id]);
  return result.affectedRows > 0;
};

const deleteHealthCamp = async (id) => {
  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  createHealthCamp,
  getAllHealthCamps,
  getHealthCampById,
  updateHealthCamp,
  deleteHealthCamp,
};
