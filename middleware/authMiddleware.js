const jwt = require("jsonwebtoken");
const { error } = require("../utils/responseHandler");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return error(res, 401, "Access token missing", { code: "TOKEN_MISSING" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return error(res, 403, "Invalid or expired token", {
        code: "TOKEN_INVALID",
      });
    }
    req.user = user;
    next();
  });
};

const verifyRole = (roles) => {
  return (req, res, next) => {
    // Debug Logging
    if (req.user) {
      console.log(
        `[AuthDebug] User Role: ${req.user.role}, Required Roles: ${JSON.stringify(roles)}`,
      );
    } else {
      console.log(`[AuthDebug] No req.user found.`);
    }

    if (!req.user || !roles.includes(req.user.role)) {
      console.log(`[AuthDebug] Access Denied.`);
      return error(
        res,
        403,
        `Access denied: Insufficient permissions. Yours: '${req.user ? req.user.role : "N/A"}'. Required: ${JSON.stringify(roles)}`,
        {
          code: "FORBIDDEN",
        },
      );
    }
    next();
  };
};

module.exports = { verifyToken, verifyRole };
