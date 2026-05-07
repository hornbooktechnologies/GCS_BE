const pool = require("./db");
require("dotenv").config();

const TABLE_NAME = "gcs_announcements";

const getColumn = async (connection, columnName) => {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, TABLE_NAME, columnName],
  );

  return rows[0] || null;
};

const getIndex = async (connection, indexName) => {
  const [rows] = await connection.query(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [process.env.DB_NAME, TABLE_NAME, indexName],
  );

  return rows[0] || null;
};

const ensureColumn = async (connection, columnName, definition) => {
  const existing = await getColumn(connection, columnName);
  if (existing) {
    console.log(`Column ${columnName} already exists in ${TABLE_NAME} - skipping`);
    return;
  }

  await connection.query(`ALTER TABLE ${TABLE_NAME} ADD COLUMN ${columnName} ${definition}`);
  console.log(`Added ${columnName} to ${TABLE_NAME}`);
};

const ensureIndex = async (connection, indexName, definition) => {
  const existing = await getIndex(connection, indexName);
  if (existing) {
    console.log(`Index ${indexName} already exists - skipping`);
    return;
  }

  await connection.query(`ALTER TABLE ${TABLE_NAME} ADD ${definition}`);
  console.log(`Added ${indexName}`);
};

const migrateAnnouncementSchema = async () => {
  const connection = await pool.getConnection();

  try {
    console.log("Upgrading announcement schema...\n");

    await ensureColumn(
      connection,
      "category",
      "VARCHAR(100) NOT NULL DEFAULT 'Notices' AFTER image_key",
    );

    console.log("");
    await ensureIndex(
      connection,
      "idx_gcs_announcements_category",
      "INDEX idx_gcs_announcements_category (category)",
    );
    await ensureIndex(
      connection,
      "idx_gcs_announcements_is_new",
      "INDEX idx_gcs_announcements_is_new (is_new)",
    );

    console.log("\nAnnouncement schema upgrade completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error upgrading announcement schema:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

migrateAnnouncementSchema();
