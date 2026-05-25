const pool = require("./db");

const ensureColumn = async (tableName, columnName, definition) => {
  const [rows] = await pool.query(
    `
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName],
  );

  if (rows.length === 0) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    console.log(`Added ${columnName} to ${tableName}`);
  }
};

const createTeamTables = async () => {
  try {
    console.log("Creating team tables...\n");

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

    await ensureColumn(
      "gcs_team_categories",
      "eyebrow",
      "VARCHAR(255) DEFAULT NULL AFTER title",
    );
    await ensureColumn(
      "gcs_team_categories",
      "heading",
      "VARCHAR(255) DEFAULT NULL AFTER eyebrow",
    );
    await ensureColumn(
      "gcs_team_categories",
      "layout_type",
      "VARCHAR(50) NOT NULL DEFAULT 'grid' AFTER heading",
    );

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

    await ensureColumn(
      "gcs_team_members",
      "visionary_leadership_title",
      "VARCHAR(255) DEFAULT NULL AFTER description",
    );
    await ensureColumn(
      "gcs_team_members",
      "visionary_leadership_description",
      "LONGTEXT DEFAULT NULL AFTER visionary_leadership_title",
    );
    await ensureColumn(
      "gcs_team_members",
      "proven_expertise_title",
      "VARCHAR(255) DEFAULT NULL AFTER visionary_leadership_description",
    );
    await ensureColumn(
      "gcs_team_members",
      "proven_expertise_description",
      "LONGTEXT DEFAULT NULL AFTER proven_expertise_title",
    );
    await ensureColumn(
      "gcs_team_members",
      "verification_label",
      "VARCHAR(255) DEFAULT NULL AFTER proven_expertise_description",
    );
    await ensureColumn(
      "gcs_team_members",
      "verification_value",
      "VARCHAR(255) DEFAULT NULL AFTER verification_label",
    );
    await ensureColumn(
      "gcs_team_members",
      "affiliation_label",
      "VARCHAR(255) DEFAULT NULL AFTER verification_value",
    );
    await ensureColumn(
      "gcs_team_members",
      "affiliation_value",
      "VARCHAR(255) DEFAULT NULL AFTER affiliation_label",
    );
    await ensureColumn(
      "gcs_team_members",
      "short_description",
      "TEXT DEFAULT NULL AFTER affiliation_value",
    );
    await ensureColumn(
      "gcs_team_members",
      "role_tag",
      "VARCHAR(255) DEFAULT NULL AFTER short_description",
    );
    await ensureColumn(
      "gcs_team_members",
      "featured_title",
      "VARCHAR(255) DEFAULT NULL AFTER role_tag",
    );
    await ensureColumn(
      "gcs_team_members",
      "featured_description",
      "LONGTEXT DEFAULT NULL AFTER featured_title",
    );
    await ensureColumn(
      "gcs_team_members",
      "slug",
      "VARCHAR(255) DEFAULT NULL AFTER id",
    );

    // Add unique index on slug if it doesn't exist
    const [idxRows] = await pool.query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'gcs_team_members'
        AND INDEX_NAME = 'uq_team_members_slug'
      LIMIT 1
    `);
    if (idxRows.length === 0) {
      await pool.query(`ALTER TABLE gcs_team_members ADD UNIQUE INDEX uq_team_members_slug (slug)`);
      console.log("Added unique index on gcs_team_members.slug");
    }

    // Backfill slugs for existing rows that have none
    const { generateUniqueSlug } = require("../utils/slug");
    const [membersWithoutSlug] = await pool.query(
      `SELECT id, name FROM gcs_team_members WHERE slug IS NULL OR slug = ''`
    );
    if (membersWithoutSlug.length > 0) {
      const connection = await pool.getConnection();
      try {
        for (const row of membersWithoutSlug) {
          const slug = await generateUniqueSlug(connection, "gcs_team_members", row.name);
          await connection.query(`UPDATE gcs_team_members SET slug = ? WHERE id = ?`, [slug, row.id]);
        }
      } finally {
        connection.release();
      }
      console.log(`Backfilled slugs for ${membersWithoutSlug.length} team members`);
    }

    console.log("gcs_team_categories and gcs_team_members tables created or already exist");
    console.log("\nTeam tables are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating team tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createTeamTables();
