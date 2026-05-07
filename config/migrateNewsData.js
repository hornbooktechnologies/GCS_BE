const pool = require("./db");
const { generateUniqueSlug } = require("../utils/slug");

const TABLE_NAME = "gcs_news";

const migrateNewsData = async () => {
  const connection = await pool.getConnection();

  try {
    console.log("Starting news data migration...\n");
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT id, name, title, slug, content, image_url, image_key,
              thumbnail_image_url, thumbnail_image_key, created_at, published_date
       FROM ${TABLE_NAME}
       ORDER BY created_at ASC, id ASC`,
    );

    console.log(`Found ${rows.length} news item(s)\n`);

    let migrated = 0;

    for (const row of rows) {
      const resolvedTitle = row.title || row.name || "Untitled News";
      const resolvedSlug =
        row.slug || (await generateUniqueSlug(connection, TABLE_NAME, resolvedTitle, row.id));
      const publishedDate =
        row.published_date ||
        (row.created_at instanceof Date
          ? row.created_at.toISOString().split("T")[0]
          : row.created_at
            ? new Date(row.created_at).toISOString().split("T")[0]
            : null);
      const content = row.content || "";
      const thumbnailUrl = row.thumbnail_image_url || row.image_url || null;
      const thumbnailKey = row.thumbnail_image_key || row.image_key || null;

      await connection.query(
        `UPDATE ${TABLE_NAME}
         SET name = ?,
             title = ?,
             slug = ?,
             content = ?,
             published_date = ?,
             status = COALESCE(status, 'published'),
             featured = COALESCE(featured, 0),
             thumbnail_image_url = ?,
             thumbnail_image_key = ?,
             image_url = COALESCE(?, image_url),
             image_key = COALESCE(?, image_key)
         WHERE id = ?`,
        [
          resolvedTitle,
          resolvedTitle,
          resolvedSlug,
          content,
          publishedDate,
          thumbnailUrl,
          thumbnailKey,
          thumbnailUrl,
          thumbnailKey,
          row.id,
        ],
      );

      migrated += 1;
      if (migrated % 10 === 0) {
        console.log(`Migrated ${migrated}/${rows.length} items`);
      }
    }

    const [verification] = await connection.query(
      `SELECT
         SUM(CASE WHEN title IS NULL OR TRIM(title) = '' THEN 1 ELSE 0 END) AS missing_titles,
         SUM(CASE WHEN slug IS NULL OR TRIM(slug) = '' THEN 1 ELSE 0 END) AS missing_slugs,
         SUM(CASE WHEN published_date IS NULL THEN 1 ELSE 0 END) AS missing_dates
       FROM ${TABLE_NAME}`,
    );
    const [duplicates] = await connection.query(
      `SELECT slug, COUNT(*) AS total
       FROM ${TABLE_NAME}
       WHERE slug IS NOT NULL AND TRIM(slug) <> ''
       GROUP BY slug
       HAVING COUNT(*) > 1`,
    );

    if (verification[0].missing_titles > 0) {
      throw new Error(`${verification[0].missing_titles} rows still have missing titles`);
    }
    if (verification[0].missing_slugs > 0) {
      throw new Error(`${verification[0].missing_slugs} rows still have missing slugs`);
    }
    if (verification[0].missing_dates > 0) {
      throw new Error(`${verification[0].missing_dates} rows still have missing published_date`);
    }
    if (duplicates.length > 0) {
      throw new Error(`Duplicate slugs found: ${duplicates.map((item) => item.slug).join(", ")}`);
    }

    await connection.query(
      `ALTER TABLE ${TABLE_NAME}
       MODIFY title VARCHAR(255) NOT NULL,
       MODIFY slug VARCHAR(255) NOT NULL,
       MODIFY content LONGTEXT NOT NULL`,
    );

    await connection.commit();

    console.log(`Migrated ${migrated} news item(s) successfully.`);
    console.log("News data migration completed successfully.");
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("Error during news data migration:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

migrateNewsData();
