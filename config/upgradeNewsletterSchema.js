const pool = require("./db");

const upgradeNewsletterSchema = async () => {
  try {
    console.log("Upgrading newsletter schema...\n");

    await pool.query(`
      ALTER TABLE gcs_newsletters
        MODIFY photo_url VARCHAR(1000) NOT NULL,
        MODIFY photo_key VARCHAR(1000) NOT NULL,
        MODIFY attachment_url VARCHAR(1000) NOT NULL,
        MODIFY attachment_key VARCHAR(1000) NOT NULL
    `);

    console.log("Newsletter schema upgrade completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error upgrading newsletter schema:", error.message);
    console.error(error);
    process.exit(1);
  }
};

upgradeNewsletterSchema();
