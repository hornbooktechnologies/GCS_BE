const pool = require("./db");

const createJournalsTables = async () => {
  try {
    console.log("Creating journals tables...\n");

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

    console.log("gcs_journals and gcs_journal_entries tables created or already exist");
    process.exit(0);
  } catch (error) {
    console.error("Error creating journals tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createJournalsTables();
