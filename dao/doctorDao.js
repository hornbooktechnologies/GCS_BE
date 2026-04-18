const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const DOCTOR_TABLE = "gcs_doctors";
const DOCTOR_SPECIALITY_TABLE = "gcs_doctor_specialities";

const getSpecialitiesByDoctorId = async (doctorId) => {
  const [rows] = await pool.query(
    `SELECT ds.speciality_id AS id, s.title, s.category
     FROM ${DOCTOR_SPECIALITY_TABLE} ds
     INNER JOIN gcs_specialities s ON s.id = ds.speciality_id
     WHERE ds.doctor_id = ?
     ORDER BY s.title ASC`,
    [doctorId],
  );
  return rows;
};

const getAllDoctors = async () => {
  const [rows] = await pool.query(
    `SELECT d.*
     FROM ${DOCTOR_TABLE} d
     ORDER BY d.created_at DESC`,
  );

  if (rows.length === 0) {
    return [];
  }

  const doctorIds = rows.map((item) => item.id);
  const placeholders = doctorIds.map(() => "?").join(", ");
  const [specialityRows] = await pool.query(
    `SELECT ds.doctor_id, ds.speciality_id AS id, s.title, s.category
     FROM ${DOCTOR_SPECIALITY_TABLE} ds
     INNER JOIN gcs_specialities s ON s.id = ds.speciality_id
     WHERE ds.doctor_id IN (${placeholders})
     ORDER BY s.title ASC`,
    doctorIds,
  );

  return rows.map((item) => ({
    ...item,
    specialities: specialityRows.filter((speciality) => speciality.doctor_id === item.id).map(({ doctor_id, ...rest }) => rest),
  }));
};

const getDoctorById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${DOCTOR_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const specialities = await getSpecialitiesByDoctorId(id);
  return {
    ...rows[0],
    specialities,
    speciality_ids: specialities.map((item) => item.id),
  };
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
      created_by,
    } = data;

    await connection.query(
      `INSERT INTO ${DOCTOR_TABLE}
        (id, name, image_url, image_key, experience, designation, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, image_url, image_key, experience, designation, description, created_by || null],
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

    const { speciality_ids, ...doctorFields } = data;
    const fieldEntries = Object.entries(doctorFields);

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
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
