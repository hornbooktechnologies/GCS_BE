const pool = require("./db");

const ensureAnnouncementAttachmentColumns = async () => {
  try {
    console.log("Updating announcements table for attachment support...\n");

    const [columns] = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'gcs_announcements'
    `);

    const existingColumns = new Set(columns.map((column) => column.COLUMN_NAME));

    if (!existingColumns.has("image_url")) {
      await pool.query(
        "ALTER TABLE gcs_announcements ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER pdf_key",
      );
      console.log("Added image_url column");
    }

    if (!existingColumns.has("image_key")) {
      await pool.query(
        "ALTER TABLE gcs_announcements ADD COLUMN image_key VARCHAR(500) DEFAULT NULL AFTER image_url",
      );
      console.log("Added image_key column");
    }

    await pool.query(`
      ALTER TABLE gcs_announcements
      MODIFY COLUMN pdf_url VARCHAR(500) DEFAULT NULL,
      MODIFY COLUMN pdf_key VARCHAR(500) DEFAULT NULL
    `);
    console.log("Updated pdf_url and pdf_key to allow NULL values");

    console.log("\nAnnouncements table attachment columns are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error updating announcements table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

ensureAnnouncementAttachmentColumns();
