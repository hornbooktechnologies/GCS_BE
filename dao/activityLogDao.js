const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const createActivityLog = async (logData) => {
  const { user_id, module_name, action, description, ip_address } = logData;
  const id = uuidv4();
  const query = `
    INSERT INTO gcs_activity_logs (id, user_id, module_name, action, description, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  try {
    await pool.query(query, [
      id,
      user_id,
      module_name,
      action,
      description,
      ip_address,
    ]);
    return { id, ...logData };
  } catch (error) {
    console.error("Error creating activity log:", error);
    // Silent fail or throw? Silent fail is often better for logging to not break main flow
    return null;
  }
};

const getAllActivityLogs = async ({ module_name, user, date, page, limit }) => {
  let query = `
    SELECT al.*, u.first_name, u.last_name, u.email
    FROM gcs_activity_logs al
    JOIN gcs_users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (module_name) {
    query += " AND al.module_name LIKE ?";
    params.push(`%${module_name}%`);
  }
  if (user) {
    query +=
      " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)";
    const term = `%${user}%`;
    params.push(term, term, term);
  }
  if (date) {
    query += " AND DATE(al.created_at) = ?";
    params.push(date);
  }

  query += " ORDER BY al.created_at DESC";

  // Only apply pagination if page and limit are provided
  if (page && limit) {
    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));
  }

  const [rows] = await pool.query(query, params);

  // Count query
  let countQuery = `
    SELECT COUNT(*) as count 
    FROM gcs_activity_logs al
    JOIN gcs_users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const countParams = [];

  if (module_name) {
    countQuery += " AND al.module_name LIKE ?";
    countParams.push(`%${module_name}%`);
  }
  if (user) {
    countQuery +=
      " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)";
    const term = `%${user}%`;
    countParams.push(term, term, term);
  }
  if (date) {
    countQuery += " AND DATE(al.created_at) = ?";
    countParams.push(date);
  }

  const [countResult] = await pool.query(countQuery, countParams);
  const total = countResult[0].count;

  return {
    logs: rows,
    total: total,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : total,
    totalPages: limit ? Math.ceil(total / limit) : 1,
  };
};

const deleteActivityLogs = async (ids) => {
  if (!ids || ids.length === 0) return 0;

  // Ensure ids is an array
  const idArray = Array.isArray(ids) ? ids : [ids];

  // Create placeholders (?, ?, ?)
  const placeholders = idArray.map(() => "?").join(", ");
  const query = `DELETE FROM gcs_activity_logs WHERE id IN (${placeholders})`;

  const [result] = await pool.query(query, idArray);
  return result.affectedRows;
};

module.exports = {
  createActivityLog,
  getAllActivityLogs,
  deleteActivityLogs,
};
