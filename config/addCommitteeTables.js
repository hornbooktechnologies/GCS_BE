const pool = require("./db");

const ensureColumn = async (tableName, columnName, definition) => {
  const [rows] = await pool.query(
    `SELECT 1
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName],
  );
  if (rows.length === 0) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    console.log(`Added ${columnName} to ${tableName}`);
  }
};

const createCommitteeTables = async () => {
  try {
    console.log("Creating committee tables...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_committees (
        id          VARCHAR(36)  NOT NULL PRIMARY KEY,
        slug        VARCHAR(220) NOT NULL,
        name        VARCHAR(255) NOT NULL,
        department  ENUM('hospital','research','medical_college','nursing') NOT NULL DEFAULT 'hospital',
        description TEXT         DEFAULT NULL,
        sort_order  INT          NOT NULL DEFAULT 0,
        is_active   TINYINT(1)   NOT NULL DEFAULT 1,
        created_by  VARCHAR(36)  DEFAULT NULL,
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_committees_slug (slug),
        KEY idx_committees_department (department),
        KEY idx_committees_is_active (is_active),
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_committee_members (
        id            VARCHAR(36)  NOT NULL PRIMARY KEY,
        committee_id  VARCHAR(36)  NOT NULL,
        member_name   VARCHAR(255) NOT NULL,
        member_role   VARCHAR(100) NOT NULL DEFAULT 'Member',
        sort_order    INT          NOT NULL DEFAULT 0,
        created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_committee_members_committee_id (committee_id),
        FOREIGN KEY (committee_id) REFERENCES gcs_committees(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await ensureColumn(
      "gcs_committee_members",
      "contact_no",
      "VARCHAR(50) DEFAULT NULL AFTER sort_order",
    );
    await ensureColumn(
      "gcs_committee_members",
      "email",
      "VARCHAR(255) DEFAULT NULL AFTER contact_no",
    );

    console.log("gcs_committees and gcs_committee_members tables created or already exist");
    console.log("\nCommittee tables are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating committee tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createCommitteeTables();
