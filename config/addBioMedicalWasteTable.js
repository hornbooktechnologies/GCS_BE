const pool = require("./db");

const addBioMedicalWasteTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gcs_bio_medical_waste (
        id VARCHAR(36) PRIMARY KEY,
        report_year SMALLINT UNSIGNED NOT NULL,
        report_month TINYINT UNSIGNED NOT NULL,
        red_kg DECIMAL(12,3) NOT NULL DEFAULT 0,
        yellow_kg DECIMAL(12,3) NOT NULL DEFAULT 0,
        blue_kg DECIMAL(12,3) NOT NULL DEFAULT 0,
        white_kg DECIMAL(12,3) NOT NULL DEFAULT 0,
        total_kg DECIMAL(12,3) NOT NULL DEFAULT 0,
        status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
        notes VARCHAR(1000) DEFAULT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_bmw_year_month (report_year, report_month),
        INDEX idx_bmw_public (status, report_year, report_month),
        CONSTRAINT fk_bmw_created_by FOREIGN KEY (created_by)
          REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [roleTables] = await connection.query("SHOW TABLES LIKE 'gcs_roles'");
    const [permissionTables] = await connection.query(
      "SHOW TABLES LIKE 'gcs_role_permissions'",
    );
    if (roleTables.length > 0 && permissionTables.length > 0) {
      await connection.query(`
        INSERT INTO gcs_role_permissions
          (id, role_id, module_key, can_create, can_list, can_edit, can_delete)
        SELECT UUID(), id, 'bio-medical-waste',
          IF(slug = 'admin', 1, 0), IF(slug = 'admin', 1, 0),
          IF(slug = 'admin', 1, 0), IF(slug = 'admin', 1, 0)
        FROM gcs_roles
        ON DUPLICATE KEY UPDATE module_key = VALUES(module_key)
      `);
    }

    await connection.commit();
    console.log("Biomedical waste table and permissions are ready");
  } catch (err) {
    await connection.rollback();
    console.error("Failed to create biomedical waste table:", err);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
};

addBioMedicalWasteTable();
