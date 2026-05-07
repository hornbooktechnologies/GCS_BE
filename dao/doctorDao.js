const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { generateUniqueSlug } = require("../utils/slug");

const DOCTOR_TABLE = "gcs_doctors";
const DOCTOR_SPECIALITY_TABLE = "gcs_doctor_specialities";

const getSpecialitiesByDoctorIds = async (doctorIds) => {
  if (!doctorIds.length) {
    return [];
  }

  const placeholders = doctorIds.map(() => "?").join(", ");
  const [rows] = await pool.query(
    `SELECT ds.doctor_id, ds.speciality_id AS id, s.title, s.slug, s.category
     FROM ${DOCTOR_SPECIALITY_TABLE} ds
     INNER JOIN gcs_specialities s ON s.id = ds.speciality_id
     WHERE ds.doctor_id IN (${placeholders})
     ORDER BY s.title ASC`,
    doctorIds,
  );

  return rows;
};

const attachSpecialities = async (doctors) => {
  if (!doctors.length) {
    return [];
  }

  const specialityRows = await getSpecialitiesByDoctorIds(doctors.map((item) => item.id));

  return doctors.map((item) => {
    const specialities = specialityRows
      .filter((speciality) => speciality.doctor_id === item.id)
      .map(({ doctor_id, ...rest }) => rest);

    return {
      ...item,
      specialities,
      speciality_ids: specialities.map((speciality) => speciality.id),
    };
  });
};

const buildDoctorFilters = (filters = {}) => {
  const joins = [];
  const where = [];
  const params = [];

  const search = filters.search ? String(filters.search).trim() : "";
  if (search) {
    where.push("(d.name LIKE ? OR d.designation LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (filters.speciality_id) {
    joins.push(`INNER JOIN ${DOCTOR_SPECIALITY_TABLE} ds ON ds.doctor_id = d.id`);
    where.push("ds.speciality_id = ?");
    params.push(filters.speciality_id);
  } else if (filters.category) {
    joins.push(`INNER JOIN ${DOCTOR_SPECIALITY_TABLE} ds ON ds.doctor_id = d.id`);
  }

  if (filters.category) {
    joins.push("INNER JOIN gcs_specialities s ON s.id = ds.speciality_id");
    where.push("s.category = ?");
    params.push(filters.category);
  }

  return { joins, where, params };
};

const getAllDoctors = async (filters = {}) => {
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
  const requestedLimit = Number.parseInt(filters.limit, 10) || 20;
  const limit = Math.min(100, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;
  const { joins, where, params } = buildDoctorFilters(filters);

  const fromClause = `
    FROM ${DOCTOR_TABLE} d
    ${joins.join("\n")}
  `;
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(DISTINCT d.id) AS total
     ${fromClause}
     ${whereClause}`,
    params,
  );

  const [rows] = await pool.query(
    `SELECT DISTINCT d.*
     ${fromClause}
     ${whereClause}
     ORDER BY d.is_hod DESC, d.display_order ASC, d.name ASC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const mappedRows = await attachSpecialities(rows);

  return {
    rows: mappedRows,
    total: countRows[0]?.total || 0,
    page,
    limit,
  };
};

const getDoctorById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${DOCTOR_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const [doctor] = await attachSpecialities(rows);
  return doctor || null;
};

const getDoctorBySlug = async (slug) => {
  const [rows] = await pool.query(`SELECT * FROM ${DOCTOR_TABLE} WHERE slug = ?`, [slug]);
  if (rows.length === 0) {
    return null;
  }

  const [doctor] = await attachSpecialities(rows);
  return doctor || null;
};

const createDoctor = async (data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const id = uuidv4();
    const {
      name,
      image_url,
      image_key,
      experience,
      designation,
      description,
      speciality_ids,
      display_order = 0,
      is_hod = 0,
      created_by,
    } = data;
    const slug = await generateUniqueSlug(connection, DOCTOR_TABLE, name);

    await connection.query(
      `INSERT INTO ${DOCTOR_TABLE}
        (id, slug, name, image_url, image_key, experience, designation, description, display_order, is_hod, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        slug,
        name,
        image_url,
        image_key,
        experience,
        designation,
        description,
        display_order,
        is_hod ? 1 : 0,
        created_by || null,
      ],
    );

    for (const specialityId of speciality_ids) {
      await connection.query(
        `INSERT INTO ${DOCTOR_SPECIALITY_TABLE}
          (id, doctor_id, speciality_id)
         VALUES (?, ?, ?)`,
        [uuidv4(), id, specialityId],
      );
    }

    await connection.commit();
    return getDoctorById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateDoctor = async (id, data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const existing = await getDoctorById(id);
    if (!existing) {
      await connection.rollback();
      return null;
    }

    const { speciality_ids, regenerate_slug, ...doctorFields } = data;
    const updateFields = { ...doctorFields };

    if (updateFields.name && updateFields.name !== existing.name && regenerate_slug !== false) {
      updateFields.slug = await generateUniqueSlug(connection, DOCTOR_TABLE, updateFields.name, id);
    }

    const fieldEntries = Object.entries(updateFields).filter(([, value]) => value !== undefined);

    if (fieldEntries.length > 0) {
      const fields = fieldEntries.map(([key]) => `${key} = ?`).join(", ");
      const values = fieldEntries.map(([, value]) => value);
      await connection.query(`UPDATE ${DOCTOR_TABLE} SET ${fields} WHERE id = ?`, [...values, id]);
    }

    if (speciality_ids) {
      await connection.query(`DELETE FROM ${DOCTOR_SPECIALITY_TABLE} WHERE doctor_id = ?`, [id]);
      for (const specialityId of speciality_ids) {
        await connection.query(
          `INSERT INTO ${DOCTOR_SPECIALITY_TABLE}
            (id, doctor_id, speciality_id)
           VALUES (?, ?, ?)`,
          [uuidv4(), id, specialityId],
        );
      }
    }

    await connection.commit();
    return getDoctorById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteDoctor = async (id) => {
  const [rows] = await pool.query(`SELECT image_key FROM ${DOCTOR_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${DOCTOR_TABLE} WHERE id = ?`, [id]);
  if (result.affectedRows > 0) {
    return { imageKey: rows[0].image_key };
  }
  return null;
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorBySlug,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
