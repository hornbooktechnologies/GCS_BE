const pool = require("./db");
const { generateUniqueSlug } = require("../utils/slug");
require("dotenv").config();

const SPECIALITY_TABLE = "gcs_specialities";
const SERVICES_TABLE = "gcs_speciality_services";

const getColumn = async (connection, columnName) => {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, SPECIALITY_TABLE, columnName],
  );

  return rows[0] || null;
};

const ensureColumn = async (connection, columnName, definition) => {
  const column = await getColumn(connection, columnName);
  if (!column) {
    await connection.query(`ALTER TABLE ${SPECIALITY_TABLE} ADD COLUMN ${columnName} ${definition}`);
    console.log(`Added ${columnName} column to ${SPECIALITY_TABLE}`);
  }
};

const ensureUniqueIndex = async (connection, indexName, columnName) => {
  const [rows] = await connection.query(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [process.env.DB_NAME, SPECIALITY_TABLE, indexName],
  );

  if (rows.length === 0) {
    await connection.query(`ALTER TABLE ${SPECIALITY_TABLE} ADD UNIQUE INDEX ${indexName} (${columnName})`);
    console.log(`Added unique index ${indexName} on ${SPECIALITY_TABLE}.${columnName}`);
  }
};

const backfillSlugs = async (connection) => {
  const [rows] = await connection.query(`SELECT id, title, slug FROM ${SPECIALITY_TABLE} ORDER BY created_at ASC, id ASC`);
  for (const row of rows) {
    if (row.slug) {
      continue;
    }

    const slug = await generateUniqueSlug(connection, SPECIALITY_TABLE, row.title);
    await connection.query(`UPDATE ${SPECIALITY_TABLE} SET slug = ? WHERE id = ?`, [slug, row.id]);
  }
};

const ensureServicesTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${SERVICES_TABLE} (
      id VARCHAR(36) PRIMARY KEY,
      speciality_id VARCHAR(36) NOT NULL,
      title VARCHAR(500) NOT NULL,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_speciality_services_speciality
        FOREIGN KEY (speciality_id) REFERENCES ${SPECIALITY_TABLE}(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log(`${SERVICES_TABLE} table created or already exists`);
};

const upgradeSpecialitySchema = async () => {
  const connection = await pool.getConnection();

  try {
    console.log("Upgrading speciality schema...\n");

    await ensureColumn(connection, "slug", "VARCHAR(255) NULL AFTER title");
    await backfillSlugs(connection);
    await connection.query(`ALTER TABLE ${SPECIALITY_TABLE} MODIFY slug VARCHAR(255) NOT NULL`);
    await ensureUniqueIndex(connection, "uq_gcs_specialities_slug", "slug");

    await ensureColumn(connection, "services_intro", "TEXT NULL AFTER brochure_type");
    await ensureColumn(connection, "services_heading", "VARCHAR(500) NULL AFTER services_intro");

    await ensureColumn(connection, "show_on_home", "BOOLEAN NOT NULL DEFAULT TRUE AFTER category");
    await ensureColumn(connection, "display_order", "INT NOT NULL DEFAULT 0 AFTER show_on_home");

    await ensureServicesTable(connection);

    console.log("\nSpeciality schema upgrade completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error upgrading speciality schema:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

upgradeSpecialitySchema();
