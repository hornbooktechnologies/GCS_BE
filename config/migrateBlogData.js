const pool = require("./db");
const { generateUniqueSlug } = require("../utils/slug");

const TABLE_NAME = "gcs_blogs";

const migrateBlogData = async () => {
  const connection = await pool.getConnection();

  try {
    console.log("Starting blog data migration...\n");
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT id, title, slug, category, status
       FROM ${TABLE_NAME}
       ORDER BY created_at ASC, id ASC`,
    );

    console.log(`Found ${rows.length} blog(s)\n`);

    for (const row of rows) {
      const resolvedSlug =
        row.slug || (await generateUniqueSlug(connection, TABLE_NAME, row.title, row.id));
      const resolvedCategory = row.category?.trim() || "General";
      const resolvedStatus = row.status || "published";

      await connection.query(
        `UPDATE ${TABLE_NAME}
         SET slug = ?, category = ?, status = ?
         WHERE id = ?`,
        [resolvedSlug, resolvedCategory, resolvedStatus, row.id],
      );
    }

    const [verification] = await connection.query(
      `SELECT
         SUM(CASE WHEN slug IS NULL OR TRIM(slug) = '' THEN 1 ELSE 0 END) AS missing_slugs
       FROM ${TABLE_NAME}`,
    );
    const [duplicates] = await connection.query(
      `SELECT slug, COUNT(*) AS total
       FROM ${TABLE_NAME}
       WHERE slug IS NOT NULL AND TRIM(slug) <> ''
       GROUP BY slug
       HAVING COUNT(*) > 1`,
    );

    if (verification[0].missing_slugs > 0) {
      throw new Error(`${verification[0].missing_slugs} rows still have missing slugs`);
    }
    if (duplicates.length > 0) {
      throw new Error(`Duplicate slugs found: ${duplicates.map((item) => item.slug).join(", ")}`);
    }

    await connection.query(
      `ALTER TABLE ${TABLE_NAME}
       MODIFY slug VARCHAR(255) NOT NULL,
       MODIFY status ENUM('draft','published') NOT NULL DEFAULT 'published'`,
    );

    await connection.commit();

    console.log(`Migrated ${rows.length} blog(s) successfully.`);
    console.log("Blog data migration completed successfully.");
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("Error during blog data migration:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

migrateBlogData();
