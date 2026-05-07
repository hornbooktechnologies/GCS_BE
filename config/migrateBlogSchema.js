const pool = require("./db");
require("dotenv").config();

const TABLE_NAME = "gcs_blogs";

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

const migrateBlogSchema = async () => {
  const connection = await pool.getConnection();

  try {
    console.log("Upgrading blog schema...\n");

    await ensureColumn(connection, "slug", "VARCHAR(255) NULL AFTER title");
    await ensureColumn(connection, "category", "VARCHAR(100) NULL AFTER slug");
    await ensureColumn(
      connection,
      "status",
      "ENUM('draft','published') NOT NULL DEFAULT 'published' AFTER category",
    );

    console.log("");
    await ensureIndex(connection, "uq_gcs_blogs_slug", "UNIQUE INDEX uq_gcs_blogs_slug (slug)");
    await ensureIndex(connection, "idx_gcs_blogs_status", "INDEX idx_gcs_blogs_status (status)");
    await ensureIndex(connection, "idx_gcs_blogs_blog_date", "INDEX idx_gcs_blogs_blog_date (blog_date)");

    console.log("\nBlog schema upgrade completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error upgrading blog schema:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

migrateBlogSchema();
