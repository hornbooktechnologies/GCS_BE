const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { generateUniqueSlug, slugify } = require("../utils/slug");

const TABLE_NAME = "gcs_blogs";

const normalizeBlogRecord = (row) => {
  if (!row) {
    return null;
  }

  return {
    ...row,
    status: row.status || "published",
    category: row.category || null,
  };
};

const resolveUniqueSlug = async (connection, title, customSlug = null, excludeId = null) => {
  const source = customSlug?.trim() || title;
  return generateUniqueSlug(connection, TABLE_NAME, source, excludeId);
};

const buildFilters = (filters = {}) => {
  const where = [];
  const params = [];

  if (filters.status && filters.status !== "all") {
    where.push("status = ?");
    params.push(filters.status);
  }

  return { where, params };
};

const createBlog = async (blogData) => {
  const {
    title,
    thumbnail_image_url,
    thumbnail_image_key,
    detail_image_url,
    detail_image_key,
    description,
    author_name,
    author_designation,
    blog_date,
    category = null,
    status = "draft",
    slug,
    display_order,
    created_by,
  } = blogData;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const id = uuidv4();
    const resolvedSlug = await resolveUniqueSlug(connection, title, slug);
    let order = display_order;

    if (order === undefined || order === null) {
      const [maxOrder] = await connection.query(
        `SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM ${TABLE_NAME}`,
      );
      order = maxOrder[0].next_order;
    }

    await connection.query(
      `INSERT INTO ${TABLE_NAME} (
        id, title, slug, category, status, thumbnail_image_url, thumbnail_image_key,
        detail_image_url, detail_image_key, description, author_name, author_designation,
        blog_date, display_order, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        resolvedSlug,
        category,
        status,
        thumbnail_image_url,
        thumbnail_image_key,
        detail_image_url,
        detail_image_key,
        description,
        author_name,
        author_designation,
        blog_date,
        order,
        created_by || null,
      ],
    );

    await connection.commit();

    return normalizeBlogRecord({
      id,
      title,
      slug: resolvedSlug,
      category,
      status,
      thumbnail_image_url,
      thumbnail_image_key,
      detail_image_url,
      detail_image_key,
      description,
      author_name,
      author_designation,
      blog_date,
      display_order: order,
      created_by: created_by || null,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAllBlogs = async (page = 1, limit = 12, filters = {}) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 12));
  const offset = (safePage - 1) * safeLimit;
  const { where, params } = buildFilters(filters);
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME}
     ${whereClause}
     ORDER BY display_order ASC, blog_date DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset],
  );
  const [countResult] = await pool.query(
    `SELECT COUNT(*) AS total FROM ${TABLE_NAME} ${whereClause}`,
    params,
  );
  const total = countResult[0].total;

  return {
    rows: rows.map(normalizeBlogRecord),
    total,
    page: safePage,
    limit: safeLimit,
    pages: Math.ceil(total / safeLimit),
  };
};

const getBlogById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [
    id,
  ]);
  return normalizeBlogRecord(rows[0]);
};

const getBlogBySlug = async (slug) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME} WHERE slug = ? AND status = 'published'`,
    [slug],
  );
  return normalizeBlogRecord(rows[0]);
};

const updateBlog = async (id, data) => {
  const existing = await getBlogById(id);
  if (!existing) {
    return null;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const updateData = { ...data };

    if (Object.prototype.hasOwnProperty.call(updateData, "slug")) {
      if (updateData.slug?.trim()) {
        updateData.slug = await resolveUniqueSlug(
          connection,
          updateData.title || existing.title,
          updateData.slug,
          id,
        );
      } else {
        delete updateData.slug;
      }
    }

    const fields = Object.keys(updateData);
    if (fields.length === 0) {
      await connection.rollback();
      return existing;
    }

    const values = fields.map((field) => updateData[field]);
    const assignments = fields.map((field) => `${field} = ?`).join(", ");

    const [result] = await connection.query(
      `UPDATE ${TABLE_NAME} SET ${assignments} WHERE id = ?`,
      [...values, id],
    );

    await connection.commit();

    return result.affectedRows > 0
      ? normalizeBlogRecord({ ...existing, ...updateData })
      : null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteBlog = async (id) => {
  const [rows] = await pool.query(
    `SELECT thumbnail_image_key, detail_image_key FROM ${TABLE_NAME} WHERE id = ?`,
    [id],
  );
  if (rows.length === 0) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [
    id,
  ]);

  if (result.affectedRows > 0) {
    return {
      deleted: true,
      thumbnailImageKey: rows[0].thumbnail_image_key,
      detailImageKey: rows[0].detail_image_key,
    };
  }
  return null;
};

const updateBlogOrder = async (orderedItems) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    for (const item of orderedItems) {
      await connection.query(
        `UPDATE ${TABLE_NAME} SET display_order = ? WHERE id = ?`,
        [item.display_order, item.id],
      );
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  updateBlogOrder,
  generateSlug: slugify,
};
