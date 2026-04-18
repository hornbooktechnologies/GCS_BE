const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_announcements";

const createAnnouncement = async (announcementData) => {
  const {
    title,
    is_new,
    url,
    pdf_url,
    pdf_key,
    image_url,
    image_key,
    display_order,
    created_by,
  } = announcementData;
  const id = uuidv4();

  let order = display_order;
  if (order === undefined || order === null) {
    const [maxOrder] = await pool.query(
      `SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM ${TABLE_NAME}`,
    );
    order = maxOrder[0].next_order;
  }

  await pool.query(
    `INSERT INTO ${TABLE_NAME} (id, title, is_new, url, pdf_url, pdf_key, image_url, image_key, display_order, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title,
      is_new ? 1 : 0,
      url || null,
      pdf_url,
      pdf_key,
      image_url || null,
      image_key || null,
      order,
      created_by || null,
    ],
  );

  return {
    id,
    title,
    is_new: !!is_new,
    url: url || null,
    pdf_url,
    pdf_key,
    image_url: image_url || null,
    image_key: image_key || null,
    display_order: order,
    created_by: created_by || null,
  };
};

const getAllAnnouncements = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME} ORDER BY display_order ASC, created_at DESC`,
  );
  return rows;
};

const getAnnouncementById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [
    id,
  ]);
  return rows[0];
};

const updateAnnouncement = async (id, data) => {
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

const deleteAnnouncement = async (id) => {
  const [rows] = await pool.query(
    `SELECT pdf_key, image_key FROM ${TABLE_NAME} WHERE id = ?`,
    [id],
  );
  if (rows.length === 0) return null;

  const pdfKey = rows[0].pdf_key;
  const imageKey = rows[0].image_key;
  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [
    id,
  ]);

  if (result.affectedRows > 0) {
    return { deleted: true, pdfKey, imageKey };
  }
  return null;
};

const updateAnnouncementOrder = async (orderedItems) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const item of orderedItems) {
      await connection.query(
        `UPDATE ${TABLE_NAME} SET display_order = ? WHERE id = ?`,
        [item.display_order, item.id],
      );
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  updateAnnouncementOrder,
};
