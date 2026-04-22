const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { MODULES, ACTIONS } = require("../utils/permissionModules");

const normalizeSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const emptyPermissions = () =>
  MODULES.reduce((acc, module) => {
    acc[module.key] = {
      create: false,
      list: false,
      edit: false,
      delete: false,
    };
    return acc;
  }, {});

const mapPermissionRows = (rows) => {
  const permissions = emptyPermissions();
  rows.forEach((row) => {
    if (!permissions[row.module_key]) return;
    permissions[row.module_key] = {
      create: Boolean(row.can_create),
      list: Boolean(row.can_list),
      edit: Boolean(row.can_edit),
      delete: Boolean(row.can_delete),
    };
  });
  return permissions;
};

const getPermissionsByRoleSlug = async (slug) => {
  if (slug === "admin") {
    return MODULES.reduce((acc, module) => {
      acc[module.key] = {
        create: true,
        list: true,
        edit: true,
        delete: true,
      };
      return acc;
    }, {});
  }

  const [rows] = await pool.query(
    `SELECT rp.*
     FROM gcs_role_permissions rp
     INNER JOIN gcs_roles r ON r.id = rp.role_id
     WHERE r.slug = ? AND r.status = 'active'`,
    [slug],
  );
  return mapPermissionRows(rows);
};

const getAllRoles = async () => {
  const [roles] = await pool.query(
    "SELECT * FROM gcs_roles ORDER BY is_system DESC, name ASC",
  );
  if (roles.length === 0) return [];

  const [permissionRows] = await pool.query(
    `SELECT rp.*
     FROM gcs_role_permissions rp
     INNER JOIN gcs_roles r ON r.id = rp.role_id
     ORDER BY r.name ASC, rp.module_key ASC`,
  );

  return roles.map((role) => ({
    ...role,
    permissions: mapPermissionRows(
      permissionRows.filter((permission) => permission.role_id === role.id),
    ),
  }));
};

const getRoleById = async (id) => {
  const [roles] = await pool.query("SELECT * FROM gcs_roles WHERE id = ?", [id]);
  if (roles.length === 0) return null;

  const [permissionRows] = await pool.query(
    "SELECT * FROM gcs_role_permissions WHERE role_id = ?",
    [id],
  );

  return {
    ...roles[0],
    permissions: mapPermissionRows(permissionRows),
  };
};

const upsertPermissions = async (connection, roleId, permissions = {}) => {
  for (const moduleDef of MODULES) {
    const modulePermissions = permissions[moduleDef.key] || {};
    await connection.query(
      `INSERT INTO gcs_role_permissions
        (id, role_id, module_key, can_create, can_list, can_edit, can_delete)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        can_create = VALUES(can_create),
        can_list = VALUES(can_list),
        can_edit = VALUES(can_edit),
        can_delete = VALUES(can_delete)`,
      [
        uuidv4(),
        roleId,
        moduleDef.key,
        modulePermissions.create ? 1 : 0,
        modulePermissions.list ? 1 : 0,
        modulePermissions.edit ? 1 : 0,
        modulePermissions.delete ? 1 : 0,
      ],
    );
  }
};

const createRole = async ({ name, slug, description, status, permissions }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const id = uuidv4();
    const roleSlug = normalizeSlug(slug || name);

    await connection.query(
      `INSERT INTO gcs_roles (id, name, slug, description, is_system, status)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [id, name, roleSlug, description || null, status || "active"],
    );
    await upsertPermissions(connection, id, permissions);

    await connection.commit();
    return getRoleById(id);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const updateRole = async (id, { name, slug, description, status, permissions }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.query("SELECT * FROM gcs_roles WHERE id = ?", [
      id,
    ]);
    if (existingRows.length === 0) {
      await connection.rollback();
      return null;
    }

    const existing = existingRows[0];
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }
    if (slug !== undefined && !existing.is_system) {
      fields.push("slug = ?");
      values.push(normalizeSlug(slug));
    }
    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description || null);
    }
    if (status !== undefined && !existing.is_system) {
      fields.push("status = ?");
      values.push(status);
    }

    if (fields.length > 0) {
      await connection.query(`UPDATE gcs_roles SET ${fields.join(", ")} WHERE id = ?`, [
        ...values,
        id,
      ]);
    }

    if (permissions && existing.slug !== "admin") {
      await upsertPermissions(connection, id, permissions);
    }

    await connection.commit();
    return getRoleById(id);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const deleteRole = async (id) => {
  const [roles] = await pool.query("SELECT * FROM gcs_roles WHERE id = ?", [id]);
  if (roles.length === 0 || roles[0].is_system) return false;

  const [users] = await pool.query("SELECT COUNT(*) AS count FROM gcs_users WHERE role = ?", [
    roles[0].slug,
  ]);
  if (users[0].count > 0) {
    const err = new Error("Role is assigned to users");
    err.code = "ROLE_IN_USE";
    throw err;
  }

  const [result] = await pool.query("DELETE FROM gcs_roles WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const userHasPermission = async (roleSlug, moduleKey, action) => {
  if (roleSlug === "admin") return true;
  if (!ACTIONS.includes(action)) return false;

  const column = {
    create: "can_create",
    list: "can_list",
    edit: "can_edit",
    delete: "can_delete",
  }[action];

  const [rows] = await pool.query(
    `SELECT rp.${column} AS allowed
     FROM gcs_role_permissions rp
     INNER JOIN gcs_roles r ON r.id = rp.role_id
     WHERE r.slug = ? AND r.status = 'active' AND rp.module_key = ?
     LIMIT 1`,
    [roleSlug, moduleKey],
  );

  return Boolean(rows[0]?.allowed);
};

module.exports = {
  normalizeSlug,
  getPermissionsByRoleSlug,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  userHasPermission,
};
