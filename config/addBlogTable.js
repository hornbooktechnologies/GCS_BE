const pool = require("./db");

const createBlogTable = async () => {
  try {
    console.log("Creating blog table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_blogs (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        thumbnail_image_url VARCHAR(500) NOT NULL,
        thumbnail_image_key VARCHAR(500) NOT NULL,
        detail_image_url VARCHAR(500) NOT NULL,
        detail_image_key VARCHAR(500) NOT NULL,
        description LONGTEXT NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        author_designation VARCHAR(255) NOT NULL,
        blog_date DATE NOT NULL,
        display_order INT DEFAULT 0,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_blogs table created or already exists");
    console.log("\nBlog table is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating blog table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createBlogTable();
