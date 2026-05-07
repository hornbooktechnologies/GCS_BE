const pool = require("./db");
const { generateUniqueSlug } = require("../utils/slug");
require("dotenv").config();

const DOCTOR_TABLE = "gcs_doctors";

const getColumn = async (connection, columnName) => {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, DOCTOR_TABLE, columnName],
  );

  return rows[0] || null;
};

const ensureColumn = async (connection, columnName, definition) => {
  const column = await getColumn(connection, columnName);
  if (!column) {
    await connection.query(`ALTER TABLE ${DOCTOR_TABLE} ADD COLUMN ${columnName} ${definition}`);
    console.log(`Added ${columnName} column to ${DOCTOR_TABLE}`);
  }
};

const ensureUniqueIndex = async (connection, indexName, columnName) => {
  const [rows] = await connection.query(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [process.env.DB_NAME, DOCTOR_TABLE, indexName],
  );

  if (rows.length === 0) {
    await connection.query(`ALTER TABLE ${DOCTOR_TABLE} ADD UNIQUE INDEX ${indexName} (${columnName})`);
    console.log(`Added unique index ${indexName} on ${DOCTOR_TABLE}.${columnName}`);
  }
};

const backfillSlugs = async (connection) => {
  const [rows] = await connection.query(`SELECT id, name, slug FROM ${DOCTOR_TABLE} ORDER BY created_at ASC, id ASC`);
  for (const row of rows) {
    if (row.slug) {
      continue;
    }

    const slug = await generateUniqueSlug(connection, DOCTOR_TABLE, row.name);
    await connection.query(`UPDATE ${DOCTOR_TABLE} SET slug = ? WHERE id = ?`, [slug, row.id]);
  }
};

const upgradeDoctorSchema = async () => {
  const connection = await pool.getConnection();

  try {
    console.log("Upgrading doctor schema...\n");

    await ensureColumn(connection, "slug", "VARCHAR(255) NULL AFTER name");
    await backfillSlugs(connection);
    await connection.query(`ALTER TABLE ${DOCTOR_TABLE} MODIFY slug VARCHAR(255) NOT NULL`);
    await ensureUniqueIndex(connection, "uq_gcs_doctors_slug", "slug");

    await ensureColumn(connection, "display_order", "INT NOT NULL DEFAULT 0 AFTER slug");
    await ensureColumn(connection, "is_hod", "TINYINT(1) NOT NULL DEFAULT 0 AFTER display_order");

    const experienceColumn = await getColumn(connection, "experience");
    if (!experienceColumn) {
      throw new Error("experience column is missing from gcs_doctors");
    }

    const dataType = String(experienceColumn.DATA_TYPE || "").toLowerCase();
    if (!["int", "integer", "bigint", "smallint", "mediumint", "tinyint"].includes(dataType)) {
      const [invalidRows] = await connection.query(
        `SELECT id, name, experience
         FROM ${DOCTOR_TABLE}
         WHERE experience IS NOT NULL
           AND TRIM(experience) <> ''
           AND TRIM(experience) NOT REGEXP '^[0-9]+$'`,
      );

      if (invalidRows.length > 0) {
        console.warn("Non-numeric experience values found. Aborting doctor schema upgrade.");
        invalidRows.forEach((row) => {
          console.warn(`- ${row.id} | ${row.name} | ${row.experience}`);
        });
        process.exit(1);
      }

      await connection.query(`UPDATE ${DOCTOR_TABLE} SET experience = '0' WHERE experience IS NULL OR TRIM(experience) = ''`);
      await connection.query(`ALTER TABLE ${DOCTOR_TABLE} MODIFY experience INT NOT NULL`);
      console.log("Converted gcs_doctors.experience from VARCHAR to INT");
    }

    console.log("\nDoctor schema upgrade completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error upgrading doctor schema:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

upgradeDoctorSchema();
