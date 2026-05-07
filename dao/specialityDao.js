const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { generateUniqueSlug } = require("../utils/slug");

const SPECIALITY_TABLE = "gcs_specialities";
const MAIN_BANNER_TABLE = "gcs_speciality_main_banners";
const SERVICES_TABLE = "gcs_speciality_services";

const mapSpecialityWithAssets = (speciality, bannerRows, serviceRows) => ({
  ...speciality,
  main_banners: bannerRows.filter((item) => item.speciality_id === speciality.id),
  services: serviceRows.filter((item) => item.speciality_id === speciality.id),
});

const getMainBannersBySpecialityId = async (specialityId) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${MAIN_BANNER_TABLE} WHERE speciality_id = ? ORDER BY display_order ASC, created_at ASC`,
    [specialityId],
  );
  return rows;
};

const getServicesBySpecialityId = async (specialityId) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${SERVICES_TABLE} WHERE speciality_id = ? ORDER BY display_order ASC, created_at ASC`,
    [specialityId],
  );
  return rows;
};

const getAllSpecialities = async (filters = {}) => {
  const params = [];
  let query = `SELECT * FROM ${SPECIALITY_TABLE}`;

  if (filters.category) {
    query += ` WHERE category = ?`;
    params.push(filters.category);
  }

  query += ` ORDER BY created_at DESC`;

  const [specialities] = await pool.query(query, params);

  if (specialities.length === 0) {
    return [];
  }

  const [bannerRows] = await pool.query(
    `SELECT * FROM ${MAIN_BANNER_TABLE} ORDER BY display_order ASC, created_at ASC`,
  );
  const [serviceRows] = await pool.query(
    `SELECT * FROM ${SERVICES_TABLE} ORDER BY display_order ASC, created_at ASC`,
  );

  return specialities.map((item) => mapSpecialityWithAssets(item, bannerRows, serviceRows));
};

const getSpecialityById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${SPECIALITY_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const [mainBanners, services] = await Promise.all([
    getMainBannersBySpecialityId(id),
    getServicesBySpecialityId(id),
  ]);

  return mapSpecialityWithAssets(rows[0], mainBanners, services);
};

const getSpecialityBySlug = async (slug) => {
  const [rows] = await pool.query(`SELECT * FROM ${SPECIALITY_TABLE} WHERE slug = ?`, [slug]);
  if (rows.length === 0) {
    return null;
  }

  const [mainBanners, services] = await Promise.all([
    getMainBannersBySpecialityId(rows[0].id),
    getServicesBySpecialityId(rows[0].id),
  ]);

  return mapSpecialityWithAssets(rows[0], mainBanners, services);
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
      services_intro = null,
      services_heading = null,
      services = [],
      created_by,
      main_banners,
    } = specialityData;
    const slug = await generateUniqueSlug(connection, SPECIALITY_TABLE, title);

    await connection.query(
      `INSERT INTO ${SPECIALITY_TABLE}
        (id, slug, title, top_banner_url, top_banner_key, sub_description, category, description, brochure_url, brochure_key, brochure_type, services_intro, services_heading, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        slug,
        title,
        top_banner_url,
        top_banner_key,
        sub_description,
        category,
        description,
        brochure_url,
        brochure_key,
        brochure_type,
        services_intro,
        services_heading,
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

    for (const item of services) {
      await connection.query(
        `INSERT INTO ${SERVICES_TABLE}
          (id, speciality_id, title, display_order)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), id, item.title, item.display_order ?? 0],
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

    const existing = await getSpecialityById(id);
    if (!existing) {
      await connection.rollback();
      return null;
    }

    const { main_banners, services, ...specialityFields } = data;
    const updateFields = { ...specialityFields };

    if (updateFields.title && updateFields.title !== existing.title) {
      updateFields.slug = await generateUniqueSlug(connection, SPECIALITY_TABLE, updateFields.title, id);
    }

    const fieldEntries = Object.entries(updateFields).filter(([, value]) => value !== undefined);

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

    if (services) {
      await connection.query(`DELETE FROM ${SERVICES_TABLE} WHERE speciality_id = ?`, [id]);

      for (const item of services) {
        await connection.query(
          `INSERT INTO ${SERVICES_TABLE}
            (id, speciality_id, title, display_order)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), id, item.title, item.display_order ?? 0],
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
  getSpecialityBySlug,
  createSpeciality,
  updateSpeciality,
  deleteSpeciality,
};
