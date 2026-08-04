const pool = require("../config/db");

const BANNER_SLOT_IDS = [1, 2];

const getAdvertisementBanners = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM gcs_advertisement_banner WHERE id IN (?, ?) ORDER BY id ASC",
    BANNER_SLOT_IDS,
  );
  return rows;
};

const getAdvertisementBannerById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM gcs_advertisement_banner WHERE id = ?",
    [id],
  );
  return rows[0] || null;
};

// Kept for callers that still expect the original first banner.
const getAdvertisementBanner = async () => {
  return getAdvertisementBannerById(BANNER_SLOT_IDS[0]);
};

const upsertAdvertisementBanner = async (data, id = BANNER_SLOT_IDS[0]) => {
  const existing = await getAdvertisementBannerById(id);

  if (existing) {
    const fields = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(data);

    if (!fields) {
      return existing;
    }

    await pool.query(
      `UPDATE gcs_advertisement_banner SET ${fields} WHERE id = ?`,
      [...values, id],
    );

    return getAdvertisementBannerById(id);
  }

  const {
    title,
    link_url = null,
    image_url = null,
    image_key = null,
    created_by = null,
  } = data;

  await pool.query(
    `INSERT INTO gcs_advertisement_banner
     (id, title, link_url, image_url, image_key, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, title, link_url, image_url, image_key, created_by],
  );

  return getAdvertisementBannerById(id);
};

const deleteAdvertisementBanner = async (id) => {
  const existing = await getAdvertisementBannerById(id);
  if (!existing) return null;

  await pool.query("DELETE FROM gcs_advertisement_banner WHERE id = ?", [id]);
  return existing;
};

module.exports = {
  BANNER_SLOT_IDS,
  getAdvertisementBanner,
  getAdvertisementBannerById,
  getAdvertisementBanners,
  upsertAdvertisementBanner,
  deleteAdvertisementBanner,
};
