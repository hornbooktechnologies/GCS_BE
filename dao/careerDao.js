const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { generateUniqueSlug } = require("../utils/slug");

// ─── Current Openings ─────────────────────────────────────────────────────────

const buildOpeningFilters = (filters = {}) => {
  const where = [];
  const params = [];

  const search = filters.search ? String(filters.search).trim() : "";
  if (search) {
    where.push("(position LIKE ? OR department LIKE ? OR location LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (filters.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters.department) {
    where.push("department = ?");
    params.push(filters.department);
  }

  return { where, params };
};

const getAllCurrentOpenings = async (filters = {}) => {
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
  const requestedLimit = Number.parseInt(filters.limit, 10) || 20;
  const limit = Math.min(100, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;
  const { where, params } = buildOpeningFilters(filters);
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM gcs_career_openings ${whereClause}`,
    params,
  );
  const [rows] = await pool.query(
    `SELECT * FROM gcs_career_openings ${whereClause}
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return { rows, total: countRows[0]?.total || 0, page, limit };
};

const getCurrentOpeningById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM gcs_career_openings WHERE id = ?",
    [id],
  );
  return rows[0] || null;
};

const getCurrentOpeningBySlug = async (slug) => {
  const [rows] = await pool.query(
    "SELECT * FROM gcs_career_openings WHERE slug = ?",
    [slug],
  );
  return rows[0] || null;
};

const createCurrentOpening = async (data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const id = uuidv4();
    const {
      position,
      education,
      description,
      experience,
      status = "open",
      location = null,
      department = null,
      closing_date = null,
      salary_range = null,
      created_by = null,
    } = data;

    const slug = await generateUniqueSlug(connection, "gcs_career_openings", position);

    await connection.query(
      `INSERT INTO gcs_career_openings
        (id, slug, position, education, description, experience,
         status, location, department, closing_date, salary_range, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, slug, position, education, description, experience,
       status, location, department, closing_date, salary_range, created_by],
    );
    await connection.commit();
    return getCurrentOpeningById(id);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const updateCurrentOpening = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const existing = await getCurrentOpeningById(id);
    if (!existing) {
      await connection.rollback();
      return null;
    }

    const { regenerate_slug, ...fields } = data;
    const updateFields = { ...fields };

    if (
      updateFields.position &&
      updateFields.position !== existing.position &&
      regenerate_slug !== false
    ) {
      updateFields.slug = await generateUniqueSlug(
        connection, "gcs_career_openings", updateFields.position, id,
      );
    }

    const fieldEntries = Object.entries(updateFields).filter(([, v]) => v !== undefined);
    if (fieldEntries.length > 0) {
      const setClauses = fieldEntries.map(([k]) => `${k} = ?`).join(", ");
      const values = fieldEntries.map(([, v]) => v);
      await connection.query(
        `UPDATE gcs_career_openings SET ${setClauses} WHERE id = ?`,
        [...values, id],
      );
    }

    await connection.commit();
    return getCurrentOpeningById(id);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const deleteCurrentOpening = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM gcs_career_openings WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
};

// ─── Career Applications ───────────────────────────────────────────────────────

const buildApplicationFilters = (filters = {}) => {
  const where = [];
  const params = [];

  const search = filters.search ? String(filters.search).trim() : "";
  if (search) {
    where.push("(a.name LIKE ? OR a.email LIKE ? OR a.position LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (filters.status) {
    where.push("a.status = ?");
    params.push(filters.status);
  }

  return { where, params };
};

const getAllCareerApplications = async (filters = {}) => {
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
  const requestedLimit = Number.parseInt(filters.limit, 10) || 50;
  const limit = Math.min(200, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;
  const { where, params } = buildApplicationFilters(filters);
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM gcs_career_applications a ${whereClause}`,
    params,
  );
  const [rows] = await pool.query(
    `SELECT a.*, o.position AS opening_position
     FROM gcs_career_applications a
     LEFT JOIN gcs_career_openings o ON o.id = a.opening_id
     ${whereClause}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return { rows, total: countRows[0]?.total || 0, page, limit };
};

const getCareerApplicationById = async (id) => {
  const [rows] = await pool.query(
    `SELECT a.*, o.position AS opening_position
     FROM gcs_career_applications a
     LEFT JOIN gcs_career_openings o ON o.id = a.opening_id
     WHERE a.id = ?`,
    [id],
  );
  return rows[0] || null;
};

const createCareerApplication = async (data) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO gcs_career_applications
      (id, opening_id, position, name, email, contact_no, city, message, resume_url, resume_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.opening_id || null,
      data.position,
      data.name,
      data.email,
      data.contact_no,
      data.city,
      data.message || null,
      data.resume_url,
      data.resume_key,
    ],
  );
  return { id, ...data };
};

const VALID_APPLICATION_STATUSES = ["pending", "reviewing", "shortlisted", "rejected", "hired"];

const updateCareerApplicationStatus = async (id, status) => {
  if (!VALID_APPLICATION_STATUSES.includes(status)) {
    throw new Error(`Invalid status value: ${status}`);
  }
  const [result] = await pool.query(
    "UPDATE gcs_career_applications SET status = ? WHERE id = ?",
    [status, id],
  );
  return result.affectedRows > 0;
};

// ─── Asset Positions (Teaching / Internship) ──────────────────────────────────

const createAssetPosition = async (tableName, data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const id = uuidv4();
    const slug = await generateUniqueSlug(connection, tableName, data.title);

    await connection.query(
      `INSERT INTO ${tableName}
        (id, slug, title, image_url, image_key, pdf_url, pdf_key, display_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        slug,
        data.title,
        data.image_url,
        data.image_key,
        data.pdf_url,
        data.pdf_key,
        data.display_order ?? 0,
        data.created_by || null,
      ],
    );
    await connection.commit();
    const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
    return rows[0];
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const getAllAssetPositions = async (tableName) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${tableName} ORDER BY display_order ASC, created_at DESC`,
  );
  return rows;
};

const getAssetPositionById = async (tableName, id) => {
  const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
  return rows[0] || null;
};

const updateAssetPosition = async (tableName, id, data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.query(
      `SELECT * FROM ${tableName} WHERE id = ?`, [id],
    );
    const existing = existingRows[0];
    if (!existing) {
      await connection.rollback();
      return false;
    }

    const { regenerate_slug, ...fields } = data;
    const updateFields = { ...fields };

    if (
      updateFields.title &&
      updateFields.title !== existing.title &&
      regenerate_slug !== false
    ) {
      updateFields.slug = await generateUniqueSlug(connection, tableName, updateFields.title, id);
    }

    const fieldEntries = Object.entries(updateFields).filter(([, v]) => v !== undefined);
    if (fieldEntries.length > 0) {
      const setClauses = fieldEntries.map(([k]) => `${k} = ?`).join(", ");
      const values = fieldEntries.map(([, v]) => v);
      await connection.query(
        `UPDATE ${tableName} SET ${setClauses} WHERE id = ?`,
        [...values, id],
      );
    }

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const deleteAssetPosition = async (tableName, id) => {
  const [rows] = await pool.query(
    `SELECT image_key, pdf_key FROM ${tableName} WHERE id = ?`,
    [id],
  );
  if (rows.length === 0) return null;

  const [result] = await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
  if (result.affectedRows > 0) {
    return { imageKey: rows[0].image_key, pdfKey: rows[0].pdf_key };
  }
  return null;
};

module.exports = {
  // Openings
  getAllCurrentOpenings,
  getCurrentOpeningById,
  getCurrentOpeningBySlug,
  createCurrentOpening,
  updateCurrentOpening,
  deleteCurrentOpening,
  // Applications
  getAllCareerApplications,
  getCareerApplicationById,
  createCareerApplication,
  updateCareerApplicationStatus,
  // Asset positions
  createAssetPosition,
  getAllAssetPositions,
  getAssetPositionById,
  updateAssetPosition,
  deleteAssetPosition,
};
