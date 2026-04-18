const pool = require("./db");

const createCareerTables = async () => {
  try {
    console.log("Creating career tables...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_career_openings (
        id VARCHAR(36) PRIMARY KEY,
        position VARCHAR(255) NOT NULL,
        education VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        experience VARCHAR(255) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_career_applications (
        id VARCHAR(36) PRIMARY KEY,
        opening_id VARCHAR(36) DEFAULT NULL,
        position VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        contact_no VARCHAR(30) NOT NULL,
        city VARCHAR(255) NOT NULL,
        message TEXT DEFAULT NULL,
        resume_url VARCHAR(500) NOT NULL,
        resume_key VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (opening_id) REFERENCES gcs_career_openings(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_teaching_positions (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        pdf_url VARCHAR(500) NOT NULL,
        pdf_key VARCHAR(500) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_internship_positions (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        pdf_url VARCHAR(500) NOT NULL,
        pdf_key VARCHAR(500) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("Career tables created or already exist");
    console.log("\nCareer module tables are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating career tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createCareerTables();
