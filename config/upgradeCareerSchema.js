const pool = require("./db");
const { generateUniqueSlug } = require("../utils/slug");
require("dotenv").config();

const OPENINGS_TABLE = "gcs_career_openings";
const APPLICATIONS_TABLE = "gcs_career_applications";
const TEACHING_TABLE = "gcs_teaching_positions";
const INTERNSHIP_TABLE = "gcs_internship_positions";

const getColumn = async (connection, tableName, columnName) => {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, tableName, columnName],
  );
  return rows[0] || null;
};

const ensureColumn = async (connection, tableName, columnName, definition) => {
  const col = await getColumn(connection, tableName, columnName);
  if (!col) {
    await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    console.log(`Added ${columnName} to ${tableName}`);
  } else {
    console.log(`Column ${columnName} already exists in ${tableName} — skipping`);
  }
};

const ensureUniqueIndex = async (connection, tableName, indexName, columnName) => {
  const [rows] = await connection.query(
    `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [process.env.DB_NAME, tableName, indexName],
  );
  if (rows.length === 0) {
    await connection.query(`ALTER TABLE ${tableName} ADD UNIQUE INDEX ${indexName} (${columnName})`);
    console.log(`Added unique index ${indexName} on ${tableName}.${columnName}`);
  } else {
    console.log(`Unique index ${indexName} already exists — skipping`);
  }
};

const backfillSlugs = async (connection, tableName, sourceColumn) => {
  const [rows] = await connection.query(
    `SELECT id, ${sourceColumn}, slug FROM ${tableName} ORDER BY created_at ASC, id ASC`,
  );
  let backfilled = 0;
  for (const row of rows) {
    if (row.slug) continue;
    const slug = await generateUniqueSlug(connection, tableName, row[sourceColumn]);
    await connection.query(`UPDATE ${tableName} SET slug = ? WHERE id = ?`, [slug, row.id]);
    backfilled++;
  }
  if (backfilled > 0) console.log(`Backfilled ${backfilled} slug(s) in ${tableName}`);
};

const upgradeCareerSchema = async () => {
  const connection = await pool.getConnection();
  try {
    console.log("Upgrading career schema...\n");

    // --- gcs_career_openings ---
    await ensureColumn(connection, OPENINGS_TABLE, "slug", "VARCHAR(255) NULL AFTER position");
    await backfillSlugs(connection, OPENINGS_TABLE, "position");
    await connection.query(`ALTER TABLE ${OPENINGS_TABLE} MODIFY slug VARCHAR(255) NOT NULL`);
    await ensureUniqueIndex(connection, OPENINGS_TABLE, "uq_gcs_career_openings_slug", "slug");

    await ensureColumn(connection, OPENINGS_TABLE, "status",
      "ENUM('draft','open','closed') NOT NULL DEFAULT 'open' AFTER slug");
    await ensureColumn(connection, OPENINGS_TABLE, "location",
      "VARCHAR(255) NULL AFTER experience");
    await ensureColumn(connection, OPENINGS_TABLE, "department",
      "VARCHAR(255) NULL AFTER location");
    await ensureColumn(connection, OPENINGS_TABLE, "closing_date",
      "DATE NULL AFTER department");
    await ensureColumn(connection, OPENINGS_TABLE, "salary_range",
      "VARCHAR(255) NULL AFTER closing_date");

    // --- gcs_career_applications ---
    await ensureColumn(connection, APPLICATIONS_TABLE, "status",
      "ENUM('pending','reviewing','shortlisted','rejected','hired') NOT NULL DEFAULT 'pending' AFTER resume_key");

    // --- gcs_teaching_positions ---
    await ensureColumn(connection, TEACHING_TABLE, "slug", "VARCHAR(255) NULL AFTER title");
    await backfillSlugs(connection, TEACHING_TABLE, "title");
    await connection.query(`ALTER TABLE ${TEACHING_TABLE} MODIFY slug VARCHAR(255) NOT NULL`);
    await ensureUniqueIndex(connection, TEACHING_TABLE, "uq_gcs_teaching_positions_slug", "slug");
    await ensureColumn(connection, TEACHING_TABLE, "display_order",
      "INT NOT NULL DEFAULT 0 AFTER slug");

    // --- gcs_internship_positions ---
    await ensureColumn(connection, INTERNSHIP_TABLE, "slug", "VARCHAR(255) NULL AFTER title");
    await backfillSlugs(connection, INTERNSHIP_TABLE, "title");
    await connection.query(`ALTER TABLE ${INTERNSHIP_TABLE} MODIFY slug VARCHAR(255) NOT NULL`);
    await ensureUniqueIndex(connection, INTERNSHIP_TABLE, "uq_gcs_internship_positions_slug", "slug");
    await ensureColumn(connection, INTERNSHIP_TABLE, "display_order",
      "INT NOT NULL DEFAULT 0 AFTER slug");

    console.log("\nCareer schema upgrade completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error upgrading career schema:", err.message);
    console.error(err);
    process.exit(1);
  } finally {
    connection.release();
  }
};

upgradeCareerSchema();
