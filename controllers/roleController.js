const roleDao = require("../dao/roleDao");
const { MODULES, ACTIONS } = require("../utils/permissionModules");
const { ok, created, error } = require("../utils/responseHandler");

const getRolePayload = (body) => ({
  name: String(body.name || "").trim(),
  slug: body.slug ? roleDao.normalizeSlug(body.slug) : undefined,
  description: body.description,
  status: body.status || "active",
  permissions: body.permissions || {},
});

const getModules = async (req, res) => {
  return ok(res, "Permission modules fetched successfully", {
    modules: MODULES,
    actions: ACTIONS,
  });
};

const getRoles = async (req, res) => {
  try {
    const roles = await roleDao.getAllRoles();
    return ok(res, "Roles fetched successfully", { roles });
  } catch (err) {
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const createRole = async (req, res) => {
  const payload = getRolePayload(req.body);
  if (!payload.name) {
    return error(res, 400, "Role name is required", { code: "MISSING_NAME" });
  }

  try {
    const role = await roleDao.createRole(payload);
    return created(res, "Role created successfully", role);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return error(res, 409, "Role slug already exists", { code: "ROLE_EXISTS" });
    }
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await roleDao.updateRole(req.params.id, getRolePayload(req.body));
    if (!role) return error(res, 404, "Role not found");
    return ok(res, "Role updated successfully", role);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return error(res, 409, "Role slug already exists", { code: "ROLE_EXISTS" });
    }
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const success = await roleDao.deleteRole(req.params.id);
    if (!success) return error(res, 400, "Role cannot be deleted");
    return ok(res, "Role deleted successfully");
  } catch (err) {
    if (err.code === "ROLE_IN_USE") {
      return error(res, 409, "Role is assigned to users", { code: "ROLE_IN_USE" });
    }
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  getModules,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};
