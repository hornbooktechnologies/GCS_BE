const pool = require("./db");

const createSympotmsTables = async () => {
  try {
    console.log("Creating sympotms tables...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_sympotms (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subtitle TEXT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_sympotm_potential_causes (
        id VARCHAR(36) PRIMARY KEY,
        sympotm_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sympotm_id) REFERENCES gcs_sympotms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_sympotms table created or already exists");
    console.log("gcs_sympotm_potential_causes table created or already exists");
    console.log("\nSympotms tables are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating sympotms tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createSympotmsTables();
