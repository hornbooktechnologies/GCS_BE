const userDao = require("../dao/userDao");
const { ok, error } = require("../utils/responseHandler");

const safeGetTodaysBirthdays = async () => {
  try {
    return await userDao.getUsersWithBirthdayToday();
  } catch (err) {
    // The current backend snapshot may not have the optional employee table yet.
    console.warn("Birthday lookup skipped:", err.message);
    return [];
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const { role } = req.user;
    const isEmployee = role === "employee" || role === "bde";

    const [totalUsers, totalEmployees, todaysBirthdays] = await Promise.all([
      userDao.countUsers(),
      userDao.countUsers("employee"),
      safeGetTodaysBirthdays(),
    ]);

    if (!isEmployee) {
      return ok(res, "Dashboard stats fetched successfully", {
        total_users: totalUsers,
        total_employees: totalEmployees,
        pending_requests: 0,
        upcoming_holiday: [],
        total_holiday: 0,
        current_month_holiday: 0,
        total_leave_request: 0,
        employees_on_leave_today: [],
        employees_upcoming_leaves: [],
        todays_birthdays: todaysBirthdays,
      });
    }

    return ok(res, "Dashboard stats fetched successfully", {
      pending: 0,
      reject_or_approve_leave: 0,
      total_leave_pending: 0,
      total_leave_used: 0,
      total_holiday: 0,
      upcoming_holiday: [],
      current_month_holiday: 0,
      employees_on_leave_today: [],
      employees_upcoming_leaves: [],
      todays_birthdays: todaysBirthdays,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  getDashboardStats,
};
