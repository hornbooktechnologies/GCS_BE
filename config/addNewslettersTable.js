const pool = require("./db");

const createNewslettersTable = async () => {
  try {
    console.log("Creating newsletters table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_newsletters (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        photo_url VARCHAR(500) NOT NULL,
        photo_key VARCHAR(500) NOT NULL,
        attachment_url VARCHAR(500) NOT NULL,
        attachment_key VARCHAR(500) NOT NULL,
        attachment_type ENUM('image', 'pdf') NOT NULL,
        year YEAR NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_newsletters table created or already exists");
    console.log("\nNewsletters table is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating newsletters table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createNewslettersTable();
