const pool = require("./db");

const createEventsTables = async () => {
  try {
    console.log("Creating events tables...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        thumbnail_image_url VARCHAR(500) NOT NULL,
        thumbnail_image_key VARCHAR(500) NOT NULL,
        event_date DATE NOT NULL,
        place VARCHAR(255) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_event_gallery_images (
        id VARCHAR(36) PRIMARY KEY,
        event_id VARCHAR(36) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES gcs_events(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_events and gcs_event_gallery_images tables created or already exist");
    console.log("\nEvents tables are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating events tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createEventsTables();
