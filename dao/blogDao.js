const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_blogs";

const createBlog = async (blogData) => {
  const {
    title,
    thumbnail_image_url,
    thumbnail_image_key,
    detail_image_url,
    detail_image_key,
    description,
    author_name,
    author_designation,
    blog_date,
    display_order,
    created_by,
  } = blogData;

  const id = uuidv4();
  let order = display_order;

  if (order === undefined || order === null) {
    const [maxOrder] = await pool.query(
      `SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM ${TABLE_NAME}`,
    );
    order = maxOrder[0].next_order;
  }

  await pool.query(
    `INSERT INTO ${TABLE_NAME} (
      id, title, thumbnail_image_url, thumbnail_image_key, detail_image_url, detail_image_key,
      description, author_name, author_designation, blog_date, display_order, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title,
      thumbnail_image_url,
      thumbnail_image_key,
      detail_image_url,
      detail_image_key,
      description,
      author_name,
      author_designation,
      blog_date,
      order,
      created_by || null,
    ],
  );

  return {
    id,
    title,
    thumbnail_image_url,
    thumbnail_image_key,
    detail_image_url,
    detail_image_key,
    description,
    author_name,
    author_designation,
    blog_date,
    display_order: order,
    created_by: created_by || null,
  };
};

const getAllBlogs = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME} ORDER BY display_order ASC, blog_date DESC, created_at DESC`,
  );
  return rows;
};

const getBlogById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [
    id,
  ]);
  return rows[0];
};

const updateBlog = async (id, data) => {
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

const deleteBlog = async (id) => {
  const [rows] = await pool.query(
    `SELECT thumbnail_image_key, detail_image_key FROM ${TABLE_NAME} WHERE id = ?`,
    [id],
  );
  if (rows.length === 0) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [
    id,
  ]);

  if (result.affectedRows > 0) {
    return {
      deleted: true,
      thumbnailImageKey: rows[0].thumbnail_image_key,
      detailImageKey: rows[0].detail_image_key,
    };
  }
  return null;
};

const updateBlogOrder = async (orderedItems) => {
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
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogOrder,
};
