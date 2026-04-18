const pool = require("./db");

const createDoctorsTables = async () => {
  try {
    console.log("Creating doctors tables...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_doctors (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        experience VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        description LONGTEXT NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_doctor_specialities (
        id VARCHAR(36) PRIMARY KEY,
        doctor_id VARCHAR(36) NOT NULL,
        speciality_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES gcs_doctors(id) ON DELETE CASCADE,
        FOREIGN KEY (speciality_id) REFERENCES gcs_specialities(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_doctors table created or already exists");
    console.log("gcs_doctor_specialities table created or already exists");
    console.log("\nDoctors tables are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating doctors tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createDoctorsTables();
