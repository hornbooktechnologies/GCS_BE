const pool = require("./db");

const createCheckupPlansTable = async () => {
  try {
    console.log("Creating checkup plans tables...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_checkup_plans (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_checkup_plan_tests (
        id VARCHAR(36) PRIMARY KEY,
        checkup_plan_id VARCHAR(36) NOT NULL,
        test_name VARCHAR(255) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (checkup_plan_id) REFERENCES gcs_checkup_plans(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_checkup_plans and gcs_checkup_plan_tests tables created or already exist");
    process.exit(0);
  } catch (error) {
    console.error("Error creating checkup plan tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createCheckupPlansTable();
