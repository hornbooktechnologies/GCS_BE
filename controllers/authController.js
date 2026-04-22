const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userDao = require("../dao/userDao");
const roleDao = require("../dao/roleDao");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");
const { ok, error } = require("../utils/responseHandler");

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, 400, "Email and password are required", {
      code: "MISSING_FIELDS",
    });
  }

  try {
    const user = await userDao.getUserByEmail(email);

    if (!user || user.status !== "active") {
      return error(res, 404, "User not found or inactive", {
        code: "AUTH_USER_NOT_FOUND",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return error(res, 401, "Invalid credentials", {
        code: "AUTH_INVALID",
      });
    }

    const permissions = await roleDao.getPermissionsByRoleSlug(user.role);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log Activity
    const activityLogDao = require("../dao/activityLogDao");
    const os = require("os");
    const getIp = () => {
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === "IPv4" && !iface.internal) return iface.address;
        }
      }
      return "127.0.0.1";
    };

    activityLogDao
      .createActivityLog({
        user_id: user.id,
        module_name: "Auth",
        action: "Login",
        description: `User ${user.email} logged in successfully.`,
        ip_address: req.ip || getIp(), // Fallback to server IP if req.ip is not available or proxy issues
      })
      .catch((err) => console.error("Error logging activity:", err));

    res.locals.activityLogged = true; // Prevent duplicate logging by middleware

    return ok(res, "Login successful", {
      user: {
        user_id: user.id, // Ensure user_id is returned for frontend consistency
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        permissions,
        dob: user.dob,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (err) {
    console.error("Login error:", err);
    return error(res, 500, "Internal server error", {
      code: "SERVER_ERROR",
      details: err.message,
    });
  }
};

const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return error(res, 401, "Missing refresh token", {
      code: "TOKEN_MISSING",
    });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, userData) => {
    if (err) {
      return error(res, 403, "Invalid or expired refresh token", {
        code: "TOKEN_INVALID",
        details: err.message,
      });
    }

    const accessToken = generateAccessToken(userData);

    return ok(res, "Access token refreshed successfully", {
      tokens: { accessToken }
    });
  });
};

module.exports = { login, refreshAccessToken };
