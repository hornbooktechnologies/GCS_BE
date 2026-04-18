const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const getUserByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM gcs_users WHERE email = ?", [
    email,
  ]);
  return rows[0];
};

const createUser = async (userData) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    password,
    role,
    status,
    dob,
  } = userData;
  const id = uuidv4();
  const [result] = await pool.query(
    "INSERT INTO gcs_users (id, first_name, last_name, email, phone_number, password, role, status, dob) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      first_name,
      last_name,
      email,
      phone_number,
      password,
      role,
      status || "active",
      dob || null,
    ],
  );
  return { id, ...userData };
};

const getUserById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, first_name, last_name, email, phone_number, role, status, dob FROM gcs_users WHERE id = ?",
    [id],
  );
  return rows[0];
};

const getAllUsers = async (role, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  let query =
    "SELECT id, first_name, last_name, email, phone_number, role, status, dob FROM gcs_users";
  let countQuery = "SELECT COUNT(*) as count FROM gcs_users";
  const params = [];

  if (role) {
    query += " WHERE role = ?";
    countQuery += " WHERE role = ?";
    params.push(role);
  } else {
    // Default behavior: exclude employees and bde if no specific role requested
    query += " WHERE role NOT IN ('employee', 'bde')";
    countQuery += " WHERE role NOT IN ('employee', 'bde')";
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  const queryParams = [...params, limit, offset];

  const [rows] = await pool.query(query, queryParams);
  const [countResult] = await pool.query(countQuery, params);

  return {
    users: rows,
    total: countResult[0].count,
    page,
    limit,
    totalPages: Math.ceil(countResult[0].count / limit),
  };
};

const updateUser = async (id, data) => {
  // Prevent updating password directly via this method if needed, or handle hashing elsewhere
  // For now, assuming data is already prepared (or no password update here)
  const fields = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(data);
  const [result] = await pool.query(
    `UPDATE gcs_users SET ${fields} WHERE id = ?`,
    [...values, id],
  );
  return result.affectedRows > 0;
};

const deleteUser = async (id) => {
  const [result] = await pool.query("DELETE FROM gcs_users WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getUsersByRoles = async (roles) => {
  console.log("--- [DEBUG] getUsersByRoles called with:", roles);
  if (!roles || roles.length === 0) return [];
  const placeholders = roles.map(() => "?").join(",");
  const [rows] = await pool.query(
    `SELECT id, email, first_name, last_name, role, dob FROM gcs_users WHERE role IN (${placeholders}) AND status = 'active'`,
    roles,
  );
  console.log(
    `--- [DEBUG] getUsersByRoles found ${rows.length} users:`,
    rows.map((u) => `${u.first_name} (${u.role})`),
  );
  return rows;
};

const countUsers = async (role) => {
  let query = "SELECT COUNT(*) as count FROM gcs_users";
  const params = [];

  if (role) {
    query += " WHERE role = ?";
    params.push(role);
  } else {
    query += " WHERE role NOT IN ('employee', 'bde')";
  }

  const [rows] = await pool.query(query, params);
  return rows[0].count;
};

const getUsersWithBirthdayToday = async () => {
  const [rows] = await pool.query(
    "SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.dob, e.user_image FROM gcs_users u LEFT JOIN gcs_employees e ON u.id = e.user_id WHERE MONTH(u.dob) = MONTH(CURDATE()) AND DAY(u.dob) = DAY(CURDATE()) AND u.status = 'active'",
  );
  return rows;
};

module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getUsersByRoles,
  countUsers,
  getUsersWithBirthdayToday,
};
