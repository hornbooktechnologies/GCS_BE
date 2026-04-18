const activityLogDao = require("../dao/activityLogDao");

const getActivityLogs = async (req, res) => {
  try {
    const { module_name, module, user, user_id, date, page, limit } = req.query;
    // Map user_id to user filter and module to module_name
    const searchTerm = user || user_id;
    const moduleTerm = module_name || module;

    const result = await activityLogDao.getAllActivityLogs({
      module_name: moduleTerm,
      user: searchTerm,
      date,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteLogs = async (req, res) => {
  try {
    let { ids } = req.body || {};

    // Support delete via URL param
    if (req.params.id) {
      ids = [req.params.id];
    }

    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const deletedCount = await activityLogDao.deleteActivityLogs(ids);
    res.json({ message: `${deletedCount} log(s) deleted successfully` });
  } catch (error) {
    console.error("Error deleting activity logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getActivityLogs,
  deleteLogs,
};
