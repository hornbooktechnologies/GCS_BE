const pool = require("./db");

const createNursingPhotoGalleryTable = async () => {
  try {
    console.log("Creating nursing photo gallery table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_nursing_photo_gallery (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_nursing_photo_gallery table created or already exists");
    process.exit(0);
  } catch (error) {
    console.error("Error creating nursing photo gallery table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createNursingPhotoGalleryTable();
