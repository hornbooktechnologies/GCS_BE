const pool = require("./db");

const TABLE_NAME = "gcs_announcements";

const inferCategory = (title = "") => {
  const value = String(title).toLowerCase();

  if (value.includes("admission")) {
    return "Admissions";
  }
  if (
    value.includes("opportunity") ||
    value.includes("position") ||
    value.includes("career") ||
    value.includes("internship")
  ) {
    return "Opportunities";
  }
  if (value.includes("event")) {
    return "Events";
  }

  return "Notices";
};

const migrateAnnouncementData = async () => {
  const connection = await pool.getConnection();

  try {
    console.log("Starting announcement data migration...\n");
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT id, title, category
       FROM ${TABLE_NAME}
       ORDER BY created_at ASC, id ASC`,
    );

    console.log(`Found ${rows.length} announcement(s)\n`);

    for (const row of rows) {
      const category = row.category?.trim() || inferCategory(row.title);

      await connection.query(
        `UPDATE ${TABLE_NAME}
         SET category = ?
         WHERE id = ?`,
        [category, row.id],
      );
    }

    await connection.commit();

    console.log(`Migrated ${rows.length} announcement(s) successfully.`);
    console.log("Announcement data migration completed successfully.");
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("Error during announcement data migration:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

migrateAnnouncementData();
