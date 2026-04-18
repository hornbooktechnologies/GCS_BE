const activityLogDao = require("../dao/activityLogDao");

const activityLogger = (req, res, next) => {
  // Store start time if needed, or just let it process
  res.on("finish", () => {
    // Only log if user is authenticated and response status is successful (or maybe log failures too? Usually actions are what we care about)
    // Let's log if user exists, regardless of status (failed attempts might be interesting but user_id might be missing)
    if (req.user) {
      const method = req.method;
      const originalUrl = req.originalUrl || req.url;

      // Filter out GET requests if they are just reading data?
      // User asked for "every events", so we log GET too.
      // But we should filter "viewing logs" to avoid infinite loop spam.
      if (originalUrl.includes("/api/activity-logs")) {
        return;
      }

      // Determine Module Name from URL
      // /api/leaves/apply -> Leave
      // /api/users/create -> User
      // /api/dashboard -> Dashboard
      let moduleName = "General";
      const parts = originalUrl.split("/"); // ["", "api", "leaves", "apply"]
      if (parts.length > 2) {
        moduleName = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
        // Remove query params if any
        moduleName = moduleName.split("?")[0];
      }

      // Determine Action
      let action = method;

      // Try to make it descriptive
      if (method === "POST") action = "Create/Apply";
      else if (method === "PUT") action = "Update";
      else if (method === "DELETE") action = "Delete";
      else {
        return; // Skip all other methods (GET, HEAD, etc.) as per user request to avoid "View" logs
      }

      // Improve Action Description based on URL keywords
      if (originalUrl.includes("/login")) action = "Login";
      if (originalUrl.includes("/apply")) action = "Apply";
      if (originalUrl.includes("/cancel")) action = "Cancel";

      // Description
      const description = `${action} ${moduleName} - ${method} ${originalUrl}`;

      // Check if this request was ALREADY logged manually by a controller
      // We can't easily know unless we set a flag.
      // If we keep manual logs, we will have duplicates.
      // Strategy: The manual logs are better. The middleware is a fallback/catch-all.
      // But checking for duplicates is hard.
      // Since the user asked for "all module", maybe we should remove manual logs and rely on this?
      // No, manual logs have rich descriptions ("Applied for 5 days"). Middleware has generic ("POST /leaves/apply").
      // We should probably NOT log in middleware if it matches the specific paths we manually logged.

      // OR: We just accept generic logs for everything else.
      // Let's keep it simple: Log everything. If duplicated, so be it, or we exclude known paths.
      // Exclude: Login (Auth), Apply Leave, Update Leave Status.

      // Let's try to detect if we should skip.
      // For now, I'll log everything. The user will see 2 logs for "Apply Leave":
      // 1. "Applied for leave..." (Manual)
      // 2. "POST /api/leaves/apply" (Middleware)
      // This might be annoying.

      // Let's use `res.locals.activityLogged` to prevent duplicates.
      if (res.locals.activityLogged) return;

      activityLogDao
        .createActivityLog({
          user_id: req.user.id,
          module_name: moduleName,
          action: action,
          description: description,
          ip_address: req.ip || "127.0.0.1",
        })
        .catch(console.error);
    }
  });
  next();
};

module.exports = activityLogger;
