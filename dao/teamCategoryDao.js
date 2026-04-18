const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_team_categories";

const createTeamCategory = async (data) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO ${TABLE_NAME} (id, title, created_by) VALUES (?, ?, ?)`,
    [id, data.title, data.created_by || null],
  );
  return { id, ...data };
};

const getAllTeamCategories = async () => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} ORDER BY title ASC, created_at DESC`);
  return rows;
};

const getTeamCategoryById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return rows[0];
};

const updateTeamCategory = async (id, data) => {
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(data);
  const [result] = await pool.query(
    `UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`,
    [...values, id],
  );
  return result.affectedRows > 0;
};

const deleteTeamCategory = async (id) => {
  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  createTeamCategory,
  getAllTeamCategories,
  getTeamCategoryById,
  updateTeamCategory,
  deleteTeamCategory,
};
