const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const TABLE_NAME = "gcs_patient_testimonials";

const createPatientTestimonial = async (testimonialData) => {
  const {
    name,
    video_url,
    display_order,
    status,
    created_by,
  } = testimonialData;
  const id = uuidv4();

  let order = display_order;
  if (order === undefined || order === null) {
    const [maxOrder] = await pool.query(
      `SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM ${TABLE_NAME}`,
    );
    order = maxOrder[0].next_order;
  }

  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 8);

  await pool.query(
    `INSERT INTO ${TABLE_NAME} (id, name, video_url, testimonial_date, testimonial_time, display_order, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name,
      video_url,
      currentDate,
      currentTime,
      order,
      status || "active",
      created_by || null,
    ],
  );

  return {
    id,
    name,
    video_url,
    testimonial_date: currentDate,
    testimonial_time: currentTime,
    display_order: order,
    status: status || "active",
    created_by: created_by || null,
  };
};

const getAllPatientTestimonials = async (includeInactive = false) => {
  let query = `SELECT * FROM ${TABLE_NAME}`;
  if (!includeInactive) {
    query += " WHERE status = 'active'";
  }
  query += " ORDER BY display_order ASC, created_at DESC";
  const [rows] = await pool.query(query);
  return rows;
};

const getPatientTestimonialById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [
    id,
  ]);
  return rows[0];
};

const updatePatientTestimonial = async (id, data) => {
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

const deletePatientTestimonial = async (id) => {
  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [
    id,
  ]);
  return result.affectedRows > 0;
};

const updatePatientTestimonialOrder = async (orderedItems) => {
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
  createPatientTestimonial,
  getAllPatientTestimonials,
  getPatientTestimonialById,
  updatePatientTestimonial,
  deletePatientTestimonial,
  updatePatientTestimonialOrder,
};
