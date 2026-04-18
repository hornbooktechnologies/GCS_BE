const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_downloads";

const createDownload = async (downloadData) => {
  const {
    title,
    image_url,
    image_key,
    pdf_url,
    pdf_key,
    created_by,
  } = downloadData;

  const id = uuidv4();

  await pool.query(
    `INSERT INTO ${TABLE_NAME}
      (id, title, image_url, image_key, pdf_url, pdf_key, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, title, image_url, image_key, pdf_url, pdf_key, created_by || null],
  );

  return {
    id,
    title,
    image_url,
    image_key,
    pdf_url,
    pdf_key,
    created_by: created_by || null,
  };
};

const getAllDownloads = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME} ORDER BY created_at DESC`,
  );
  return rows;
};

const getDownloadById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return rows[0];
};

const updateDownload = async (id, data) => {
  const fields = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(data);

  const [result] = await pool.query(
    `UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`,
    [...values, id],
  );
  return result.affectedRows > 0;
};

const deleteDownload = async (id) => {
  const [rows] = await pool.query(
    `SELECT image_key, pdf_key FROM ${TABLE_NAME} WHERE id = ?`,
    [id],
  );
  if (rows.length === 0) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  if (result.affectedRows > 0) {
    return {
      imageKey: rows[0].image_key,
      pdfKey: rows[0].pdf_key,
    };
  }
  return null;
};

module.exports = {
  createDownload,
  getAllDownloads,
  getDownloadById,
  updateDownload,
  deleteDownload,
};
