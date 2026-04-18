const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_news";

const createNews = async (data) => {
  const id = uuidv4();
  let order = data.display_order;

  if (order === undefined || order === null) {
    const [maxOrder] = await pool.query(
      `SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM ${TABLE_NAME}`,
    );
    order = maxOrder[0].next_order;
  }

  await pool.query(
    `INSERT INTO ${TABLE_NAME}
      (id, name, image_url, image_key, display_order, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.image_url, data.image_key, order, data.created_by || null],
  );

  return { id, ...data, display_order: order };
};

const getAllNews = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME} ORDER BY display_order ASC, created_at DESC`,
  );
  return rows;
};

const getNewsById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return rows[0];
};

const updateNews = async (id, data) => {
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(data);
  const [result] = await pool.query(
    `UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`,
    [...values, id],
  );
  return result.affectedRows > 0;
};

const deleteNews = async (id) => {
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

const updateNewsOrder = async (orderedItems) => {
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
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  updateNewsOrder,
};
