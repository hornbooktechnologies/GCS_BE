const pool = require("./db");

const createSpecialitiesTables = async () => {
  try {
    console.log("Creating specialities tables...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_specialities (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        top_banner_url VARCHAR(500) NOT NULL,
        top_banner_key VARCHAR(500) NOT NULL,
        sub_description TEXT NOT NULL,
        category ENUM('general', 'super') NOT NULL,
        description LONGTEXT NOT NULL,
        brochure_url VARCHAR(500) NOT NULL,
        brochure_key VARCHAR(500) NOT NULL,
        brochure_type ENUM('image', 'pdf') NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_speciality_main_banners (
        id VARCHAR(36) PRIMARY KEY,
        speciality_id VARCHAR(36) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (speciality_id) REFERENCES gcs_specialities(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_specialities table created or already exists");
    console.log("gcs_speciality_main_banners table created or already exists");
    console.log("\nSpecialities tables are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating specialities tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createSpecialitiesTables();
