const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const COMMITTEES_TABLE = "gcs_committees";
const MEMBERS_TABLE = "gcs_committee_members";

const buildMembersSubquery = () => `
  SELECT
    m.id,
    m.committee_id,
    m.member_name,
    m.member_role,
    m.sort_order
  FROM ${MEMBERS_TABLE} m
  ORDER BY m.sort_order ASC, m.id ASC
`;

// ── Public reads ──────────────────────────────────────────────────────────────

const getAllCommittees = async (department = null) => {
  const params = [];
  let whereClause = "WHERE c.is_active = 1";
  if (department) {
    whereClause += " AND c.department = ?";
    params.push(department);
  }

  const [committees] = await pool.query(
    `SELECT c.id, c.slug, c.name, c.department, c.description, c.sort_order
     FROM ${COMMITTEES_TABLE} c
     ${whereClause}
     ORDER BY c.department ASC, c.sort_order ASC, c.name ASC`,
    params,
  );

  if (committees.length === 0) return [];

  const committeeIds = committees.map((c) => c.id);
  const [members] = await pool.query(
    `SELECT id, committee_id, member_name, member_role, sort_order, contact_no, email
     FROM ${MEMBERS_TABLE}
     WHERE committee_id IN (?)
     ORDER BY sort_order ASC, id ASC`,
    [committeeIds],
  );

  const membersMap = {};
  for (const m of members) {
    if (!membersMap[m.committee_id]) membersMap[m.committee_id] = [];
    membersMap[m.committee_id].push(m);
  }

  return committees.map((c) => ({ ...c, members: membersMap[c.id] || [] }));
};

const getCommitteeBySlug = async (slug) => {
  const [rows] = await pool.query(
    `SELECT id, slug, name, department, description, sort_order
     FROM ${COMMITTEES_TABLE}
     WHERE slug = ? AND is_active = 1
     LIMIT 1`,
    [slug],
  );
  if (rows.length === 0) return null;

  const committee = rows[0];
  const [members] = await pool.query(
    `SELECT id, member_name, member_role, sort_order, contact_no, email
     FROM ${MEMBERS_TABLE}
     WHERE committee_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [committee.id],
  );
  return { ...committee, members };
};

const getCommitteeById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, slug, name, department, description, sort_order, is_active
     FROM ${COMMITTEES_TABLE}
     WHERE id = ?
     LIMIT 1`,
    [id],
  );
  if (rows.length === 0) return null;

  const committee = rows[0];
  const [members] = await pool.query(
    `SELECT id, member_name, member_role, sort_order, contact_no, email
     FROM ${MEMBERS_TABLE}
     WHERE committee_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [committee.id],
  );
  return { ...committee, members };
};

// ── Admin: committee CRUD ─────────────────────────────────────────────────────

const createCommittee = async (data) => {
  const id = uuidv4();
  const slug = await _generateUniqueSlug(data.name);
  await pool.query(
    `INSERT INTO ${COMMITTEES_TABLE}
       (id, slug, name, department, description, sort_order, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      slug,
      data.name,
      data.department || "hospital",
      data.description || null,
      data.sort_order != null ? data.sort_order : 0,
      data.created_by || null,
    ],
  );
  return { id, slug };
};

const updateCommittee = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
    const slug = await _generateUniqueSlug(data.name, id);
    fields.push("slug = ?");
    values.push(slug);
  }
  if (data.department !== undefined) { fields.push("department = ?"); values.push(data.department); }
  if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description || null); }
  if (data.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(data.sort_order); }
  if (data.is_active !== undefined) { fields.push("is_active = ?"); values.push(data.is_active); }

  if (fields.length === 0) return false;

  const [result] = await pool.query(
    `UPDATE ${COMMITTEES_TABLE} SET ${fields.join(", ")} WHERE id = ?`,
    [...values, id],
  );
  return result.affectedRows > 0;
};

const deleteCommittee = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM ${COMMITTEES_TABLE} WHERE id = ?`,
    [id],
  );
  return result.affectedRows > 0;
};

// ── Admin: member CRUD ────────────────────────────────────────────────────────

const addMember = async (committeeId, data) => {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO ${MEMBERS_TABLE}
       (id, committee_id, member_name, member_role, sort_order, contact_no, email)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      committeeId,
      data.member_name,
      data.member_role || "Member",
      data.sort_order != null ? data.sort_order : 0,
      data.contact_no || null,
      data.email || null,
    ],
  );
  return id;
};

const updateMember = async (memberId, data) => {
  const fields = [];
  const values = [];
  if (data.member_name !== undefined) { fields.push("member_name = ?"); values.push(data.member_name); }
  if (data.member_role !== undefined) { fields.push("member_role = ?"); values.push(data.member_role); }
  if (data.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(data.sort_order); }
  if (data.contact_no !== undefined) { fields.push("contact_no = ?"); values.push(data.contact_no || null); }
  if (data.email !== undefined) { fields.push("email = ?"); values.push(data.email || null); }

  if (fields.length === 0) return false;

  const [result] = await pool.query(
    `UPDATE ${MEMBERS_TABLE} SET ${fields.join(", ")} WHERE id = ? AND committee_id = ?`,
    [...values, memberId, data.committee_id],
  );
  return result.affectedRows > 0;
};

const deleteMember = async (memberId, committeeId) => {
  const [result] = await pool.query(
    `DELETE FROM ${MEMBERS_TABLE} WHERE id = ? AND committee_id = ?`,
    [memberId, committeeId],
  );
  return result.affectedRows > 0;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const _slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const _generateUniqueSlug = async (name, excludeId = null) => {
  const base = _slugify(name);
  let slug = base;
  let counter = 1;

  while (true) {
    const params = [slug];
    let query = `SELECT id FROM ${COMMITTEES_TABLE} WHERE slug = ?`;
    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    if (rows.length === 0) break;
    slug = `${base}-${counter++}`;
  }

  return slug;
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
