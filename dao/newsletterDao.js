const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_newsletters";

const createNewsletter = async (newsletterData) => {
  const {
    title,
    photo_url,
    photo_key,
    attachment_url,
    attachment_key,
    attachment_type,
    year,
    created_by,
  } = newsletterData;

  const id = uuidv4();

  await pool.query(
    `INSERT INTO ${TABLE_NAME}
      (id, title, photo_url, photo_key, attachment_url, attachment_key, attachment_type, year, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title,
      photo_url,
      photo_key,
      attachment_url,
      attachment_key,
      attachment_type,
      year,
      created_by || null,
    ],
  );

  return {
    id,
    title,
    photo_url,
    photo_key,
    attachment_url,
    attachment_key,
    attachment_type,
    year,
    created_by: created_by || null,
  };
};

const getAllNewsletters = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME} ORDER BY year DESC, created_at DESC`,
  );
  return rows;
};

const getNewsletterById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return rows[0];
};

const updateNewsletter = async (id, data) => {
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

const deleteNewsletter = async (id) => {
  const [rows] = await pool.query(
    `SELECT photo_key, attachment_key FROM ${TABLE_NAME} WHERE id = ?`,
    [id],
  );
  if (rows.length === 0) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  if (result.affectedRows > 0) {
    return {
      photoKey: rows[0].photo_key,
      attachmentKey: rows[0].attachment_key,
    };
  }
  return null;
};

module.exports = {
  createNewsletter,
  getAllNewsletters,
  getNewsletterById,
  updateNewsletter,
  deleteNewsletter,
};
