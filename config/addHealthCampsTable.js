const pool = require("./db");

const createHealthCampsTable = async () => {
  try {
    console.log("Creating health camps table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_health_camps (
        id VARCHAR(36) PRIMARY KEY,
        year YEAR NOT NULL,
        camps INT NOT NULL,
        no_of_patients INT NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_health_camps table created or already exists");
    console.log("\nHealth camps table is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating health camps table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createHealthCampsTable();
