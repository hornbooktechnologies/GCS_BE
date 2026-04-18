const pool = require("../config/db");

const SINGLETON_ID = 1;

const getAdvertisementBanner = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM gcs_advertisement_banner WHERE id = ?",
    [SINGLETON_ID],
  );
  return rows[0] || null;
};

const upsertAdvertisementBanner = async (data) => {
  const existing = await getAdvertisementBanner();

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
      [...values, SINGLETON_ID],
    );

    return getAdvertisementBanner();
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
    [SINGLETON_ID, title, link_url, image_url, image_key, created_by],
  );

  return getAdvertisementBanner();
};

module.exports = {
  getAdvertisementBanner,
  upsertAdvertisementBanner,
};
