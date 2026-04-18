const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_team_members";

const getAllTeamMembers = async () => {
  const [rows] = await pool.query(
    `SELECT members.*, categories.title AS category_title
     FROM ${TABLE_NAME} members
     INNER JOIN gcs_team_categories categories ON categories.id = members.category_id
     ORDER BY categories.title ASC, members.created_at DESC`,
  );
  return rows;
};

const getTeamMemberById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return rows[0];
};

const createTeamMember = async (data) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO ${TABLE_NAME}
      (id, category_id, name, subtitle, image_url, image_key, description, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.category_id,
      data.name,
      data.subtitle,
      data.image_url,
      data.image_key,
      data.description,
      data.created_by || null,
    ],
  );
  return { id, ...data };
};

const updateTeamMember = async (id, data) => {
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(data);
  const [result] = await pool.query(
    `UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`,
    [...values, id],
  );
  return result.affectedRows > 0;
};

const deleteTeamMember = async (id) => {
  const [rows] = await pool.query(`SELECT image_key FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  if (result.affectedRows > 0) {
    return { imageKey: rows[0].image_key };
  }
  return null;
};

module.exports = {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
