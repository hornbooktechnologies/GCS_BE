const pool = require("./db");

const createTestimonialTables = async () => {
  try {
    console.log("Creating testimonial tables...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_doctor_testimonials (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        video_url VARCHAR(500) NOT NULL,
        testimonial_date DATE NOT NULL,
        testimonial_time TIME NOT NULL,
        display_order INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_doctor_testimonials table created or already exists");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_patient_testimonials (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        video_url VARCHAR(500) NOT NULL,
        testimonial_date DATE NOT NULL,
        testimonial_time TIME NOT NULL,
        display_order INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_patient_testimonials table created or already exists");

    console.log("\nTestimonial tables are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating testimonial tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createTestimonialTables();
