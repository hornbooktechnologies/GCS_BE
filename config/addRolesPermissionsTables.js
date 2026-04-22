const pool = require("./db");

const DEFAULT_MODULES = [
  "dashboard",
  "users",
  "roles",
  "banners",
  "doctor-testimonials",
  "patient-testimonials",
  "social-profiles",
  "announcements",
  "advertisement-banner",
  "events",
  "newsletters",
  "career",
  "downloads",
  "team-categories",
  "team",
  "awards",
  "news",
  "health-camps",
  "checkup-plans",
  "nodel-officers",
  "results",
  "campus-life",
  "student-testimonials",
  "facilities",
  "journals",
  "nursing-photo-gallery",
  "specialities",
  "doctors",
  "symptoms",
  "blogs",
  "activity-logs",
];

const seedRole = async (connection, role) => {
  await connection.query(
    `INSERT INTO gcs_roles (id, name, slug, description, is_system, status)
     VALUES (UUID(), ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), is_system = VALUES(is_system), status = VALUES(status)`,
    [role.name, role.slug, role.description, role.is_system, role.status],
  );

  const [rows] = await connection.query("SELECT id FROM gcs_roles WHERE slug = ?", [
    role.slug,
  ]);
  const roleId = rows[0].id;

  for (const moduleKey of DEFAULT_MODULES) {
    await connection.query(
      `INSERT INTO gcs_role_permissions
        (id, role_id, module_key, can_create, can_list, can_edit, can_delete)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        can_create = VALUES(can_create),
        can_list = VALUES(can_list),
        can_edit = VALUES(can_edit),
        can_delete = VALUES(can_delete)`,
      [
        roleId,
        moduleKey,
        role.fullAccess ? 1 : 0,
        role.fullAccess ? 1 : 0,
        role.fullAccess ? 1 : 0,
        role.fullAccess ? 1 : 0,
      ],
    );
  }
};

const addRolesPermissionsTables = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS gcs_roles (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NULL,
        is_system BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS gcs_role_permissions (
        id VARCHAR(36) PRIMARY KEY,
        role_id VARCHAR(36) NOT NULL,
        module_key VARCHAR(100) NOT NULL,
        can_create BOOLEAN DEFAULT FALSE,
        can_list BOOLEAN DEFAULT FALSE,
        can_edit BOOLEAN DEFAULT FALSE,
        can_delete BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_role_module (role_id, module_key),
        FOREIGN KEY (role_id) REFERENCES gcs_roles(id) ON DELETE CASCADE
      )
    `);

    try {
      await connection.query("ALTER TABLE gcs_users MODIFY role VARCHAR(100) DEFAULT 'admin'");
    } catch (err) {
      if (!String(err.message).includes("check that column/key exists")) {
        throw err;
      }
    }

    await seedRole(connection, {
      name: "Admin",
      slug: "admin",
      description: "Full system access",
      is_system: 1,
      status: "active",
      fullAccess: true,
    });

    await seedRole(connection, {
      name: "HR",
      slug: "hr",
      description: "Default HR role",
      is_system: 1,
      status: "active",
      fullAccess: false,
    });

    await seedRole(connection, {
      name: "Manager",
      slug: "manager",
      description: "Default manager role",
      is_system: 1,
      status: "active",
      fullAccess: false,
    });

    await connection.commit();
    console.log("Roles and permissions tables created successfully");
  } catch (err) {
    await connection.rollback();
    console.error("Failed to create roles and permissions tables:", err);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
};

addRolesPermissionsTables();
