const pool = require("./db");
const { createJournalSlug } = require("../utils/journalUtils");

const databaseName = process.env.DB_NAME;

const columnExists = async (tableName, columnName) => {
  const [rows] = await pool.query(
    `SELECT 1
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
      LIMIT 1`,
    [databaseName, tableName, columnName],
  );
  return rows.length > 0;
};

const indexExists = async (tableName, indexName) => {
  const [rows] = await pool.query(
    `SELECT 1
       FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?
      LIMIT 1`,
    [databaseName, tableName, indexName],
  );
  return rows.length > 0;
};

const addColumnIfMissing = async (tableName, columnName, definition) => {
  if (!(await columnExists(tableName, columnName))) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

const ensureJournalSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gcs_journals (
      id VARCHAR(36) PRIMARY KEY,
      volume VARCHAR(100) NOT NULL,
      number VARCHAR(100) NOT NULL,
      duration VARCHAR(255) NOT NULL,
      slug VARCHAR(255) DEFAULT NULL,
      issue_pdf_url VARCHAR(500) DEFAULT NULL,
      issue_pdf_key VARCHAR(500) DEFAULT NULL,
      display_order INT NOT NULL DEFAULT 0,
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
      section ENUM('editorial', 'review_article', 'original_article', 'case_report') NOT NULL,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      pdf_url VARCHAR(500) DEFAULT NULL,
      pdf_key VARCHAR(500) DEFAULT NULL,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (journal_id) REFERENCES gcs_journals(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await addColumnIfMissing("gcs_journals", "slug", "VARCHAR(255) DEFAULT NULL AFTER duration");
  await addColumnIfMissing(
    "gcs_journals",
    "issue_pdf_url",
    "VARCHAR(500) DEFAULT NULL AFTER slug",
  );
  await addColumnIfMissing(
    "gcs_journals",
    "issue_pdf_key",
    "VARCHAR(500) DEFAULT NULL AFTER issue_pdf_url",
  );
  await addColumnIfMissing(
    "gcs_journals",
    "display_order",
    "INT NOT NULL DEFAULT 0 AFTER issue_pdf_key",
  );

  await pool.query(`
    ALTER TABLE gcs_journal_entries
      MODIFY COLUMN section ENUM('editorial', 'review_article', 'original_article', 'case_report') NOT NULL,
      MODIFY COLUMN pdf_url VARCHAR(500) DEFAULT NULL,
      MODIFY COLUMN pdf_key VARCHAR(500) DEFAULT NULL
  `);

  const [journalsWithoutSlugs] = await pool.query(
    "SELECT id, volume, number, duration FROM gcs_journals WHERE slug IS NULL OR slug = ''",
  );
  for (const journal of journalsWithoutSlugs) {
    const baseSlug = createJournalSlug(journal.volume, journal.number, journal.duration);
    const [duplicates] = await pool.query(
      "SELECT id FROM gcs_journals WHERE slug = ? AND id <> ? LIMIT 1",
      [baseSlug, journal.id],
    );
    const slug = duplicates.length > 0 ? `${baseSlug}-${String(journal.id).slice(0, 8)}` : baseSlug;
    await pool.query("UPDATE gcs_journals SET slug = ? WHERE id = ?", [slug, journal.id]);
  }

  if (!(await indexExists("gcs_journals", "uq_gcs_journals_slug"))) {
    await pool.query("CREATE UNIQUE INDEX uq_gcs_journals_slug ON gcs_journals (slug)");
  }
};

module.exports = { ensureJournalSchema };
