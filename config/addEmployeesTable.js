const pool = require("./db");

const createEmployeesTable = async () => {
  try {
    console.log("Creating employees table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_employees (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL UNIQUE,
        employee_code VARCHAR(100) DEFAULT NULL,
        designation VARCHAR(255) DEFAULT NULL,
        department VARCHAR(255) DEFAULT NULL,
        joining_date DATE DEFAULT NULL,
        user_image VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES gcs_users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_employees table created or already exists");
    console.log("\nEmployees table is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating employees table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createEmployeesTable();
