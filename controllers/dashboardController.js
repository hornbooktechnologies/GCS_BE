const userDao = require("../dao/userDao");
const pool = require("../config/db");
const { ok, error } = require("../utils/responseHandler");

const safeGetTodaysBirthdays = async () => {
  try {
    return await userDao.getUsersWithBirthdayToday();
  } catch (err) {
    // Birthday data should never block the dashboard response.
    return [];
  }
};

const countTableRows = async (tableName) => {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM ${tableName}`);
  return rows[0].count;
};

const getDashboardStats = async (req, res) => {
  try {
    const { role } = req.user;
    const isEmployee = role === "employee" || role === "bde";

    const [
      totalUsers,
      totalEmployees,
      totalDoctors,
      totalSpecialities,
      totalSymptoms,
      totalBlogs,
      todaysBirthdays,
    ] = await Promise.all([
      userDao.countUsers(),
      userDao.countUsers("employee"),
      countTableRows("gcs_doctors"),
      countTableRows("gcs_specialities"),
      countTableRows("gcs_sympotms"),
      countTableRows("gcs_blogs"),
      safeGetTodaysBirthdays(),
    ]);

    if (!isEmployee) {
      return ok(res, "Dashboard stats fetched successfully", {
        total_users: totalUsers,
        total_employees: totalEmployees,
        total_doctors: totalDoctors,
        total_specialities: totalSpecialities,
        total_symptoms: totalSymptoms,
        total_blogs: totalBlogs,
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
      total_users: totalUsers,
      total_doctors: totalDoctors,
      total_specialities: totalSpecialities,
      total_symptoms: totalSymptoms,
      total_blogs: totalBlogs,
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
