const pool = require("./db");

const createFacilitiesTable = async () => {
  try {
    console.log("Creating facilities table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_facilities (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_facilities table created or already exists");
    process.exit(0);
  } catch (error) {
    console.error("Error creating facilities table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createFacilitiesTable();
