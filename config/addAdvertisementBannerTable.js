const pool = require("./db");

const createAdvertisementBannerTable = async () => {
  try {
    console.log("Creating advertisement banner table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_advertisement_banner (
        id TINYINT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        link_url VARCHAR(500) DEFAULT NULL,
        image_url VARCHAR(500) DEFAULT NULL,
        image_key VARCHAR(500) DEFAULT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_advertisement_banner table created or already exists");
    console.log("\nAdvertisement banner table is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating advertisement banner table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createAdvertisementBannerTable();
