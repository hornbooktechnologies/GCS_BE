const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const createBanner = async (bannerData) => {
  const { title, image_url, image_key, link_url, display_order, status, created_by } = bannerData;
  const id = uuidv4();

  // If no display_order provided, put it at the end
  let order = display_order;
  if (order === undefined || order === null) {
    const [maxOrder] = await pool.query(
      "SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM gcs_banners"
    );
    order = maxOrder[0].next_order;
  }

  const query = `
    INSERT INTO gcs_banners (id, title, image_url, image_key, link_url, display_order, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await pool.query(query, [
    id,
    title,
    image_url,
    image_key,
    link_url || null,
    order,
    status || "active",
    created_by || null,
  ]);

  return { id, title, image_url, image_key, link_url, display_order: order, status: status || "active", created_by };
};

const getAllBanners = async (includeInactive = false) => {
  let query = "SELECT * FROM gcs_banners";
  if (!includeInactive) {
    query += " WHERE status = 'active'";
  }
  query += " ORDER BY display_order ASC, created_at DESC";

  const [rows] = await pool.query(query);
  return rows;
};

const getBannerById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM gcs_banners WHERE id = ?", [id]);
  return rows[0];
};

const updateBanner = async (id, data) => {
  const fields = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(data);

  const [result] = await pool.query(
    `UPDATE gcs_banners SET ${fields} WHERE id = ?`,
    [...values, id]
  );
  return result.affectedRows > 0;
};

const deleteBanner = async (id) => {
  // First get the banner to return image_key for S3 cleanup
  const [rows] = await pool.query("SELECT image_key FROM gcs_banners WHERE id = ?", [id]);
  if (rows.length === 0) return null;

  const imageKey = rows[0].image_key;
  const [result] = await pool.query("DELETE FROM gcs_banners WHERE id = ?", [id]);

  if (result.affectedRows > 0) {
    return { deleted: true, imageKey };
  }
  return null;
};

const updateBannerOrder = async (orderedItems) => {
  // orderedItems is an array of { id, display_order }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const item of orderedItems) {
      await connection.query(
        "UPDATE gcs_banners SET display_order = ? WHERE id = ?",
        [item.display_order, item.id]
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

const countBanners = async () => {
  const [rows] = await pool.query("SELECT COUNT(*) as count FROM gcs_banners");
  return rows[0].count;
};

module.exports = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  updateBannerOrder,
  countBanners,
};
