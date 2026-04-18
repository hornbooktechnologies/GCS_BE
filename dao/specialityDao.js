const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const SPECIALITY_TABLE = "gcs_specialities";
const MAIN_BANNER_TABLE = "gcs_speciality_main_banners";

const mapSpecialityWithBanners = (speciality, bannerRows) => ({
  ...speciality,
  main_banners: bannerRows.filter((item) => item.speciality_id === speciality.id),
});

const getMainBannersBySpecialityId = async (specialityId) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${MAIN_BANNER_TABLE} WHERE speciality_id = ? ORDER BY display_order ASC, created_at ASC`,
    [specialityId],
  );
  return rows;
};

const getAllSpecialities = async () => {
  const [specialities] = await pool.query(
    `SELECT * FROM ${SPECIALITY_TABLE} ORDER BY created_at DESC`,
  );

  if (specialities.length === 0) {
    return [];
  }

  const [bannerRows] = await pool.query(
    `SELECT * FROM ${MAIN_BANNER_TABLE} ORDER BY display_order ASC, created_at ASC`,
  );

  return specialities.map((item) => mapSpecialityWithBanners(item, bannerRows));
};

const getSpecialityById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${SPECIALITY_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const mainBanners = await getMainBannersBySpecialityId(id);
  return {
    ...rows[0],
    main_banners: mainBanners,
  };
};

const createSpeciality = async (specialityData) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const id = uuidv4();
    const {
      title,
      top_banner_url,
      top_banner_key,
      sub_description,
      category,
      description,
      brochure_url,
      brochure_key,
      brochure_type,
      created_by,
      main_banners,
    } = specialityData;

    await connection.query(
      `INSERT INTO ${SPECIALITY_TABLE}
        (id, title, top_banner_url, top_banner_key, sub_description, category, description, brochure_url, brochure_key, brochure_type, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        top_banner_url,
        top_banner_key,
        sub_description,
        category,
        description,
        brochure_url,
        brochure_key,
        brochure_type,
        created_by || null,
      ],
    );

    for (let index = 0; index < main_banners.length; index += 1) {
      const item = main_banners[index];
      await connection.query(
        `INSERT INTO ${MAIN_BANNER_TABLE}
          (id, speciality_id, image_url, image_key, display_order)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), id, item.image_url, item.image_key, index + 1],
      );
    }

    await connection.commit();
    return getSpecialityById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateSpeciality = async (id, data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { main_banners, ...specialityFields } = data;
    const fieldEntries = Object.entries(specialityFields);

    if (fieldEntries.length > 0) {
      const fields = fieldEntries.map(([key]) => `${key} = ?`).join(", ");
      const values = fieldEntries.map(([, value]) => value);
      await connection.query(
        `UPDATE ${SPECIALITY_TABLE} SET ${fields} WHERE id = ?`,
        [...values, id],
      );
    }

    if (main_banners) {
      await connection.query(`DELETE FROM ${MAIN_BANNER_TABLE} WHERE speciality_id = ?`, [id]);

      for (let index = 0; index < main_banners.length; index += 1) {
        const item = main_banners[index];
        await connection.query(
          `INSERT INTO ${MAIN_BANNER_TABLE}
            (id, speciality_id, image_url, image_key, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), id, item.image_url, item.image_key, index + 1],
        );
      }
    }

    await connection.commit();
    return getSpecialityById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteSpeciality = async (id) => {
  const existing = await getSpecialityById(id);
  if (!existing) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${SPECIALITY_TABLE} WHERE id = ?`, [id]);
  if (result.affectedRows === 0) {
    return null;
  }

  return {
    topBannerKey: existing.top_banner_key,
    brochureKey: existing.brochure_key,
    mainBannerKeys: existing.main_banners.map((item) => item.image_key),
  };
};

module.exports = {
  getAllSpecialities,
  getSpecialityById,
  createSpeciality,
  updateSpeciality,
  deleteSpeciality,
};
