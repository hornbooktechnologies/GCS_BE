const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { generateUniqueSlug } = require("../utils/slug");

const TABLE_NAME = "gcs_team_members";

const getAllTeamMembers = async () => {
  const [rows] = await pool.query(
    `SELECT
       members.*,
       categories.title AS category_title,
       categories.eyebrow AS category_eyebrow,
       categories.heading AS category_heading,
       categories.layout_type AS category_layout_type
     FROM ${TABLE_NAME} members
     INNER JOIN gcs_team_categories categories ON categories.id = members.category_id
     ORDER BY categories.title ASC, members.created_at DESC`,
  );
  return rows;
};

const getTeamMemberById = async (id) => {
  const [rows] = await pool.query(
    `SELECT
       members.*,
       categories.title AS category_title,
       categories.eyebrow AS category_eyebrow,
       categories.heading AS category_heading,
       categories.layout_type AS category_layout_type
     FROM ${TABLE_NAME} members
     INNER JOIN gcs_team_categories categories ON categories.id = members.category_id
     WHERE members.id = ?`,
    [id],
  );
  return rows[0];
};

const getTeamMemberBySlug = async (slug) => {
  const [rows] = await pool.query(
    `SELECT
       members.*,
       categories.title AS category_title,
       categories.eyebrow AS category_eyebrow,
       categories.heading AS category_heading,
       categories.layout_type AS category_layout_type
     FROM ${TABLE_NAME} members
     INNER JOIN gcs_team_categories categories ON categories.id = members.category_id
     WHERE members.slug = ?`,
    [slug],
  );
  return rows[0];
};

const createTeamMember = async (data) => {
  const id = uuidv4();
  const connection = await pool.getConnection();
  try {
    const slug = await generateUniqueSlug(connection, TABLE_NAME, data.name);
    await connection.query(
      `INSERT INTO ${TABLE_NAME}
        (
          id,
          slug,
          category_id,
          name,
          subtitle,
          image_url,
          image_key,
          description,
          short_description,
          role_tag,
          featured_title,
          featured_description,
          visionary_leadership_title,
          visionary_leadership_description,
          proven_expertise_title,
          proven_expertise_description,
          verification_label,
          verification_value,
          affiliation_label,
          affiliation_value,
          created_by
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        slug,
        data.category_id,
        data.name,
        data.subtitle,
        data.image_url,
        data.image_key,
        data.description,
        data.short_description || null,
        data.role_tag || null,
        data.featured_title || null,
        data.featured_description || null,
        data.visionary_leadership_title || null,
        data.visionary_leadership_description || null,
        data.proven_expertise_title || null,
        data.proven_expertise_description || null,
        data.verification_label || null,
        data.verification_value || null,
        data.affiliation_label || null,
        data.affiliation_value || null,
        data.created_by || null,
      ],
    );
    return { id, slug, ...data };
  } finally {
    connection.release();
  }
};

const updateTeamMember = async (id, data) => {
  const updateData = { ...data };
  if (updateData.name) {
    const connection = await pool.getConnection();
    try {
      updateData.slug = await generateUniqueSlug(connection, TABLE_NAME, updateData.name, id);
    } finally {
      connection.release();
    }
  }
  const fields = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(updateData);
  const [result] = await pool.query(
    `UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`,
    [...values, id],
  );
  return result.affectedRows > 0;
};

const deleteTeamMember = async (id) => {
  const [rows] = await pool.query(`SELECT image_key FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  if (result.affectedRows > 0) {
    return { imageKey: rows[0].image_key };
  }
  return null;
};

module.exports = {
  getAllTeamMembers,
  getTeamMemberById,
  getTeamMemberBySlug,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
