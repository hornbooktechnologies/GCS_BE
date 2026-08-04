const pool = require("./db");

const createJourneyMilestonesTables = async () => {
  try {
    console.log("Creating journey milestone tables...\n");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_journey_milestones (
        id VARCHAR(36) PRIMARY KEY,
        year VARCHAR(20) NOT NULL,
        icon_key VARCHAR(50) NOT NULL,
        color_key VARCHAR(50) NOT NULL DEFAULT 'blue',
        side ENUM('left', 'right') NOT NULL DEFAULT 'left',
        display_order INT NOT NULL DEFAULT 0,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_journey_milestone_events (
        id VARCHAR(36) PRIMARY KEY,
        milestone_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (milestone_id) REFERENCES gcs_journey_milestones(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("Journey milestone tables created or already exist");
    process.exit(0);
  } catch (error) {
    console.error("Error creating journey milestone tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createJourneyMilestonesTables();
