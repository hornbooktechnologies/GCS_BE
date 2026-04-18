const userDao = require("../dao/userDao");
const bcrypt = require("bcryptjs");
const { ok, created, error } = require("../utils/responseHandler");

const createUser = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    password,
    role,
    status,
    dob,
  } = req.body;

  if (!first_name || !email || !password || !role) {
    return error(res, 400, "Missing required fields", {
      code: "MISSING_FIELDS",
    });
  }

  try {
    const existing = await userDao.getUserByEmail(email);
    if (existing) {
      return error(res, 409, "User already exists", { code: "USER_EXISTS" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userDao.createUser({
      first_name,
      last_name,
      email,
      phone_number,
      password: hashedPassword,
      role,
      status,
      dob,
    });

    // Remove password from response
    delete newUser.password;

    return created(res, "User created successfully", newUser);
  } catch (err) {
    console.error("Create user error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllUsers = async (req, res) => {
  const { role, page, limit } = req.query;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  try {
    const result = await userDao.getAllUsers(role, pageNum, limitNum);

    // Format response to be consistent
    const responseData = {
      data: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };

    return ok(res, "Users fetched successfully", responseData);
  } catch (err) {
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userDao.getUserById(id);
    if (!user) return error(res, 404, "User not found");
    return ok(res, "User fetched successfully", user);
  } catch (err) {
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { password, ...updateData } = req.body; // Separate password

  // ensure dob is handled if passed in updateData (it is, because updateData includes all other fields)

  try {
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const success = await userDao.updateUser(id, updateData);
    if (!success) return error(res, 404, "User not found");
    return ok(res, "User updated successfully");
  } catch (err) {
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await userDao.deleteUser(id);
    if (!success) return error(res, 404, "User not found");
    return ok(res, "User deleted successfully");
  } catch (err) {
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
