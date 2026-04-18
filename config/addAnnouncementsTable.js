const pool = require("./db");

const createAnnouncementsTable = async () => {
  try {
    console.log("Creating announcements table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_announcements (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        is_new TINYINT(1) DEFAULT 0,
        url VARCHAR(500) DEFAULT NULL,
        pdf_url VARCHAR(500) DEFAULT NULL,
        pdf_key VARCHAR(500) DEFAULT NULL,
        image_url VARCHAR(500) DEFAULT NULL,
        image_key VARCHAR(500) DEFAULT NULL,
        display_order INT DEFAULT 0,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_announcements table created or already exists");
    console.log("\nAnnouncements table is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating announcements table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createAnnouncementsTable();
