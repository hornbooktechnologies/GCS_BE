const pool = require("./db");

const createTeamTables = async () => {
  try {
    console.log("Creating team tables...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_team_categories (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_team_members (
        id VARCHAR(36) PRIMARY KEY,
        category_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        description LONGTEXT NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES gcs_team_categories(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("gcs_team_categories and gcs_team_members tables created or already exist");
    console.log("\nTeam tables are ready.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating team tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createTeamTables();
