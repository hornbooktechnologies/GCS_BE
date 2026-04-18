const pool = require("./db");

const createSocialProfilesTable = async () => {
  try {
    console.log("Creating social profiles table...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_social_profiles (
        id TINYINT PRIMARY KEY,
        facebook VARCHAR(500) DEFAULT NULL,
        twitter VARCHAR(500) DEFAULT NULL,
        linkedin VARCHAR(500) DEFAULT NULL,
        youtube VARCHAR(500) DEFAULT NULL,
        instagram VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_social_profiles table created or already exists");
    console.log("\nSocial profiles table is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating social profiles table:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createSocialProfilesTable();
