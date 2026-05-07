const pool = require("./db");

const createNewsTable = async () => {
  try {
    console.log("Creating news table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_news (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        published_date DATE DEFAULT NULL,
        status ENUM('draft','published') NOT NULL DEFAULT 'published',
        featured TINYINT(1) NOT NULL DEFAULT 0,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        thumbnail_image_url VARCHAR(500) DEFAULT NULL,
        thumbnail_image_key VARCHAR(500) DEFAULT NULL,
        detail_image_url VARCHAR(500) DEFAULT NULL,
        detail_image_key VARCHAR(500) DEFAULT NULL,
        display_order INT DEFAULT 0,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_gcs_news_slug (slug),
        KEY idx_gcs_news_published_date (published_date),
        KEY idx_gcs_news_status (status),
        KEY idx_gcs_news_featured (featured),
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_news table created or already exists");
    console.log("\nNews table is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating news table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createNewsTable();
