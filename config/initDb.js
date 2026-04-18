const pool = require("./db");

const createTables = async () => {
  try {
    console.log("Starting database table creation...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_users (
        id VARCHAR(36) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) DEFAULT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone_number VARCHAR(20) DEFAULT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'hr', 'manager', 'employee', 'bde') DEFAULT 'admin',
        status ENUM('active', 'inactive') DEFAULT 'active',
        dob DATE DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_users table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_activity_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        module_name VARCHAR(100) DEFAULT NULL,
        action VARCHAR(100) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES gcs_users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_activity_logs table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_banners (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        link_url VARCHAR(500) DEFAULT NULL,
        display_order INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_banners table created successfully");

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
    console.log("gcs_doctor_testimonials table created successfully");

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
    console.log("gcs_patient_testimonials table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_social_profiles (
        id TINYINT PRIMARY KEY,
        facebook VARCHAR(500) DEFAULT NULL,
        twitter VARCHAR(500) DEFAULT NULL,
        linkedin VARCHAR(500) DEFAULT NULL,
        youtube VARCHAR(500) DEFAULT NULL,
        instagram VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_social_profiles table created successfully");

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
    console.log("gcs_announcements table created successfully");

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
    console.log("gcs_blogs table created successfully");

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
    console.log("gcs_advertisement_banner table created successfully");

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
    console.log("gcs_events table created successfully");

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
    console.log("gcs_event_gallery_images table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_newsletters (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        photo_url VARCHAR(500) NOT NULL,
        photo_key VARCHAR(500) NOT NULL,
        attachment_url VARCHAR(500) NOT NULL,
        attachment_key VARCHAR(500) NOT NULL,
        attachment_type ENUM('image', 'pdf') NOT NULL,
        year YEAR NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_newsletters table created successfully");

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
    console.log("gcs_career_openings table created successfully");

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
    console.log("gcs_career_applications table created successfully");

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
    console.log("gcs_teaching_positions table created successfully");

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
    console.log("gcs_internship_positions table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_downloads (
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
    console.log("gcs_downloads table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_team_categories (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_team_categories table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_team_members (
        id VARCHAR(36) PRIMARY KEY,
        category_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        description LONGTEXT NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES gcs_team_categories(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_team_members table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_awards (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        display_order INT DEFAULT 0,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_awards table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_news (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        display_order INT DEFAULT 0,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_news table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_health_camps (
        id VARCHAR(36) PRIMARY KEY,
        year YEAR NOT NULL,
        camps INT NOT NULL,
        no_of_patients INT NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_health_camps table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_checkup_plans (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_checkup_plans table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_checkup_plan_tests (
        id VARCHAR(36) PRIMARY KEY,
        checkup_plan_id VARCHAR(36) NOT NULL,
        test_name VARCHAR(255) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (checkup_plan_id) REFERENCES gcs_checkup_plans(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_checkup_plan_tests table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_nodel_officers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        position VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_nodel_officers table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_results (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        pdf_url VARCHAR(500) NOT NULL,
        pdf_key VARCHAR(500) NOT NULL,
        year YEAR NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_results table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_campus_life (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_campus_life table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_student_testimonials (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_student_testimonials table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_facilities (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_facilities table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_journals (
        id VARCHAR(36) PRIMARY KEY,
        volume VARCHAR(100) NOT NULL,
        number VARCHAR(100) NOT NULL,
        duration VARCHAR(255) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_journals table created successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_journal_entries (
        id VARCHAR(36) PRIMARY KEY,
        journal_id VARCHAR(36) NOT NULL,
        section ENUM('editorial', 'original_article', 'case_report') NOT NULL,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        pdf_url VARCHAR(500) NOT NULL,
        pdf_key VARCHAR(500) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (journal_id) REFERENCES gcs_journals(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("gcs_journal_entries table created successfully");

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
    console.log("gcs_nursing_photo_gallery table created successfully");

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
    console.log("gcs_specialities table created successfully");

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
    console.log("gcs_speciality_main_banners table created successfully");

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
    console.log("gcs_doctors table created successfully");

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
    console.log("gcs_doctor_specialities table created successfully");

    const bcrypt = require("bcryptjs");
    const { v4: uuidv4 } = require("uuid");

    const [existingAdmin] = await pool.query(
      "SELECT id FROM gcs_users WHERE email = ?",
      ["admin@gcshospital.com"],
    );

    if (existingAdmin.length === 0) {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      await pool.query(
        "INSERT INTO gcs_users (id, first_name, last_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          adminId,
          "Admin",
          "GCS",
          "admin@gcshospital.com",
          hashedPassword,
          "admin",
          "active",
        ],
      );
      console.log(
        "Default admin user created (admin@gcshospital.com / Admin@123)",
      );
    } else {
      console.log("Default admin user already exists, skipping...");
    }

    console.log("\nAll tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createTables();
