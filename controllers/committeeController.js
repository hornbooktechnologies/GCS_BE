const committeeDao = require("../dao/committeeDao");
const { ok, created, error } = require("../utils/responseHandler");

// ── Public ────────────────────────────────────────────────────────────────────

const getAllCommittees = async (req, res) => {
  try {
    const { department } = req.query;
    const validDepartments = ["hospital", "research", "medical_college", "nursing"];
    const dept = validDepartments.includes(department) ? department : null;

    const committees = await committeeDao.getAllCommittees(dept);
    return ok(res, "Committees fetched successfully", { committees });
  } catch (err) {
    console.error("Get all committees error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getCommitteeBySlug = async (req, res) => {
  try {
    const committee = await committeeDao.getCommitteeBySlug(req.params.slug);
    if (!committee) {
      return error(res, 404, "Committee not found");
    }
    return ok(res, "Committee fetched successfully", { committee });
  } catch (err) {
    console.error("Get committee by slug error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

// ── Admin: committees ─────────────────────────────────────────────────────────

const createCommittee = async (req, res) => {
  try {
    const { name, department, description, sort_order } = req.body;
    if (!name || !department) {
      return error(res, 400, "name and department are required", { code: "MISSING_FIELDS" });
    }
    const validDepartments = ["hospital", "research", "medical_college", "nursing"];
    if (!validDepartments.includes(department)) {
      return error(res, 400, "Invalid department value", { code: "INVALID_DATA" });
    }

    const result = await committeeDao.createCommittee({
      name: name.trim(),
      department,
      description: description ? description.trim() : null,
      sort_order: sort_order != null ? Number(sort_order) : 0,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Committee created successfully", result);
  } catch (err) {
    console.error("Create committee error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getCommitteeById = async (req, res) => {
  try {
    const committee = await committeeDao.getCommitteeById(req.params.id);
    if (!committee) {
      return error(res, 404, "Committee not found");
    }
    return ok(res, "Committee fetched successfully", { committee });
  } catch (err) {
    console.error("Get committee by id error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateCommittee = async (req, res) => {
  try {
    const { name, department, description, sort_order, is_active } = req.body;

    const validDepartments = ["hospital", "research", "medical_college", "nursing"];
    if (department && !validDepartments.includes(department)) {
      return error(res, 400, "Invalid department value", { code: "INVALID_DATA" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (department !== undefined) updateData.department = department;
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);
    if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    const updated = await committeeDao.updateCommittee(req.params.id, updateData);
    if (!updated) {
      return error(res, 404, "Committee not found");
    }
    return ok(res, "Committee updated successfully");
  } catch (err) {
    console.error("Update committee error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteCommittee = async (req, res) => {
  try {
    const deleted = await committeeDao.deleteCommittee(req.params.id);
    if (!deleted) {
      return error(res, 404, "Committee not found");
    }
    return ok(res, "Committee deleted successfully");
  } catch (err) {
    console.error("Delete committee error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

// ── Admin: members ────────────────────────────────────────────────────────────

const addMember = async (req, res) => {
  try {
    const { member_name, member_role, sort_order, contact_no, email } = req.body;
    if (!member_name) {
      return error(res, 400, "member_name is required", { code: "MISSING_FIELDS" });
    }

    const committee = await committeeDao.getCommitteeById(req.params.id);
    if (!committee) {
      return error(res, 404, "Committee not found");
    }

    const id = await committeeDao.addMember(req.params.id, {
      member_name: member_name.trim(),
      member_role: member_role ? member_role.trim() : "Member",
      sort_order: sort_order != null ? Number(sort_order) : 0,
      contact_no: contact_no ? contact_no.trim() : null,
      email: email ? email.trim() : null,
    });

    return created(res, "Member added successfully", { id });
  } catch (err) {
    console.error("Add committee member error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const { member_name, member_role, sort_order, contact_no, email } = req.body;

    const updateData = { committee_id: req.params.id };
    if (member_name !== undefined) updateData.member_name = member_name.trim();
    if (member_role !== undefined) updateData.member_role = member_role.trim();
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);
    if (contact_no !== undefined) updateData.contact_no = contact_no ? contact_no.trim() : null;
    if (email !== undefined) updateData.email = email ? email.trim() : null;

    if (Object.keys(updateData).length === 1) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    const updated = await committeeDao.updateMember(req.params.memberId, updateData);
    if (!updated) {
      return error(res, 404, "Member not found");
    }
    return ok(res, "Member updated successfully");
  } catch (err) {
    console.error("Update committee member error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const deleted = await committeeDao.deleteMember(req.params.memberId, req.params.id);
    if (!deleted) {
      return error(res, 404, "Member not found");
    }
    return ok(res, "Member deleted successfully");
  } catch (err) {
    console.error("Delete committee member error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  getAllCommittees,
  getCommitteeBySlug,
  getCommitteeById,
  createCommittee,
  updateCommittee,
  deleteCommittee,
  addMember,
  updateMember,
  deleteMember,
};
