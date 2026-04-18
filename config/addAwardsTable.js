const pool = require("./db");

const createAwardsTable = async () => {
  try {
    console.log("Creating awards table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_awards (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        display_order INT DEFAULT 0,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_awards table created or already exists");
    console.log("\nAwards table is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating awards table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createAwardsTable();
