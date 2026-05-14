const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_campus_life";

const createCampusLife = async (data) => {
  const id = uuidv4();
  const { title, image_url, image_key, created_by } = data;

  await pool.query(
    `INSERT INTO ${TABLE_NAME} (id, title, image_url, image_key, created_by)
     VALUES (?, ?, ?, ?, ?)`,
    [id, title, image_url, image_key, created_by || null],
  );

  return { id, title, image_url, image_key, created_by: created_by || null };
};

const buildCampusLifeFilters = ({ search } = {}) => {
  const conditions = [];
  const values = [];

  if (search && search.trim()) {
    conditions.push("title LIKE ?");
    values.push(`%${search.trim()}%`);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
};

const getAllCampusLife = async ({ page = 1, limit = 12, search } = {}) => {
  const offset = (page - 1) * limit;
  const { whereClause, values } = buildCampusLifeFilters({ search });
  const [[countRow]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ${TABLE_NAME} ${whereClause}`,
    values,
  );
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME} ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );

  const total = Number(countRow?.total || 0);
  const pages = Math.max(1, Math.ceil(total / limit));

  return {
    items: rows,
    pagination: {
      total,
      page,
      limit,
      pages,
      has_next_page: page < pages,
      has_prev_page: page > 1,
    },
  };
};

const getCampusLifeById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return rows[0] || null;
};

const updateCampusLife = async (id, data) => {
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(data);
  const [result] = await pool.query(`UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`, [...values, id]);
  return result.affectedRows > 0;
};

const deleteCampusLife = async (id) => {
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
  createCampusLife,
  getAllCampusLife,
  getCampusLifeById,
  updateCampusLife,
  deleteCampusLife,
};
