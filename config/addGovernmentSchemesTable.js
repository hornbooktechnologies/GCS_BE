const pool = require("./db");

const createGovernmentSchemesTable = async () => {
  try {
    console.log("Creating government schemes table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_government_schemes (
        id VARCHAR(36) PRIMARY KEY,
        scheme_name VARCHAR(255) NOT NULL,
        badge_text VARCHAR(100) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        cash_less_cover VARCHAR(255) DEFAULT NULL,
        required_documents JSON DEFAULT NULL,
        opd_visits INT DEFAULT NULL,
        ipd_admissions INT DEFAULT NULL,
        dialysis_count INT DEFAULT NULL,
        chemo_count INT DEFAULT NULL,
        free_opd_specialities JSON DEFAULT NULL,
        empanelled_specialities JSON DEFAULT NULL,
        display_order INT DEFAULT 0,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_government_schemes table created or already exists");
    process.exit(0);
  } catch (error) {
    console.error("Error creating government schemes table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createGovernmentSchemesTable();
