const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const createCurrentOpening = async (data) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO gcs_career_openings
      (id, position, education, description, experience, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.position,
      data.education,
      data.description,
      data.experience,
      data.created_by || null,
    ],
  );
  return { id, ...data };
};

const getAllCurrentOpenings = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM gcs_career_openings ORDER BY created_at DESC",
  );
  return rows;
};

const getCurrentOpeningById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM gcs_career_openings WHERE id = ?", [id]);
  return rows[0];
};

const updateCurrentOpening = async (id, data) => {
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(data);
  const [result] = await pool.query(
    `UPDATE gcs_career_openings SET ${fields} WHERE id = ?`,
    [...values, id],
  );
  return result.affectedRows > 0;
};

const deleteCurrentOpening = async (id) => {
  const [result] = await pool.query("DELETE FROM gcs_career_openings WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const createCareerApplication = async (data) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO gcs_career_applications
      (id, opening_id, position, name, email, contact_no, city, message, resume_url, resume_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.opening_id || null,
      data.position,
      data.name,
      data.email,
      data.contact_no,
      data.city,
      data.message || null,
      data.resume_url,
      data.resume_key,
    ],
  );
  return { id, ...data };
};

const getAllCareerApplications = async () => {
  const [rows] = await pool.query(
    `SELECT applications.*, openings.position AS opening_position
     FROM gcs_career_applications applications
     LEFT JOIN gcs_career_openings openings ON openings.id = applications.opening_id
     ORDER BY applications.created_at DESC`,
  );
  return rows;
};

const createAssetPosition = async (tableName, data) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO ${tableName}
      (id, title, image_url, image_key, pdf_url, pdf_key, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.image_url,
      data.image_key,
      data.pdf_url,
      data.pdf_key,
      data.created_by || null,
    ],
  );
  return { id, ...data };
};

const getAllAssetPositions = async (tableName) => {
  const [rows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
  return rows;
};

const getAssetPositionById = async (tableName, id) => {
  const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
  return rows[0];
};

const updateAssetPosition = async (tableName, id, data) => {
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(data);
  const [result] = await pool.query(
    `UPDATE ${tableName} SET ${fields} WHERE id = ?`,
    [...values, id],
  );
  return result.affectedRows > 0;
};

const deleteAssetPosition = async (tableName, id) => {
  const [rows] = await pool.query(
    `SELECT image_key, pdf_key FROM ${tableName} WHERE id = ?`,
    [id],
  );
  if (rows.length === 0) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
  if (result.affectedRows > 0) {
    return {
      imageKey: rows[0].image_key,
      pdfKey: rows[0].pdf_key,
    };
  }
  return null;
};

module.exports = {
  createCurrentOpening,
  getAllCurrentOpenings,
  getCurrentOpeningById,
  updateCurrentOpening,
  deleteCurrentOpening,
  createCareerApplication,
  getAllCareerApplications,
  createAssetPosition,
  getAllAssetPositions,
  getAssetPositionById,
  updateAssetPosition,
  deleteAssetPosition,
};
