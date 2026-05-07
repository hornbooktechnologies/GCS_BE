const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { slugify, generateUniqueSlug } = require("../utils/slug");

const TABLE_NAME = "gcs_news";

const normalizeNewsRecord = (row) => {
  if (!row) {
    return null;
  }

  const title = row.title || row.name;
  const thumbnail_image_url = row.thumbnail_image_url || row.image_url;
  const thumbnail_image_key = row.thumbnail_image_key || row.image_key;

  return {
    ...row,
    title,
    name: title,
    thumbnail_image_url,
    thumbnail_image_key,
    image_url: thumbnail_image_url,
    image_key: thumbnail_image_key,
    content: row.content || "",
    featured: Boolean(row.featured),
  };
};

const resolveUniqueSlug = async (connection, title, excludeId = null) => {
  return generateUniqueSlug(connection, TABLE_NAME, title, excludeId);
};

const buildFilters = (filters = {}) => {
  const where = [];
  const params = [];

  if (filters.status && filters.status !== "all") {
    where.push("status = ?");
    params.push(filters.status);
  }

  if (typeof filters.featured === "boolean") {
    where.push("featured = ?");
    params.push(filters.featured ? 1 : 0);
  }

  if (filters.search) {
    where.push("(COALESCE(title, name) LIKE ? OR content LIKE ?)");
    const term = `%${filters.search}%`;
    params.push(term, term);
  }

  return { where, params };
};

const createNews = async (data) => {
  const {
    title,
    content = "",
    thumbnail_image_url,
    thumbnail_image_key,
    detail_image_url,
    detail_image_key,
    published_date,
    status = "draft",
    featured = false,
    display_order,
    created_by,
  } = data;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const id = uuidv4();
    const slug = await resolveUniqueSlug(connection, title);
    const pubDate = published_date || new Date().toISOString().split("T")[0];

    let order = display_order;
    if (order === undefined || order === null) {
      const [maxOrder] = await connection.query(
        `SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM ${TABLE_NAME}`,
      );
      order = maxOrder[0].next_order;
    }

    await connection.query(
      `INSERT INTO ${TABLE_NAME} (
        id, name, image_url, image_key, title, slug, content,
        thumbnail_image_url, thumbnail_image_key, detail_image_url, detail_image_key,
        published_date, status, featured, display_order, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        thumbnail_image_url,
        thumbnail_image_key,
        title,
        slug,
        content,
        thumbnail_image_url,
        thumbnail_image_key,
        detail_image_url || null,
        detail_image_key || null,
        pubDate,
        status,
        featured ? 1 : 0,
        order,
        created_by || null,
      ],
    );

    await connection.commit();

    return normalizeNewsRecord({
      id,
      name: title,
      image_url: thumbnail_image_url,
      image_key: thumbnail_image_key,
      title,
      slug,
      content,
      thumbnail_image_url,
      thumbnail_image_key,
      detail_image_url: detail_image_url || null,
      detail_image_key: detail_image_key || null,
      published_date: pubDate,
      status,
      featured,
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

const getAllNews = async (page = 1, limit = 10, filters = {}) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
  const offset = (safePage - 1) * safeLimit;
  const { where, params } = buildFilters(filters);
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const sortBy = filters.sortBy === "oldest" ? "oldest" : "latest";
  const orderBy =
    sortBy === "oldest"
      ? "display_order ASC, published_date ASC, created_at ASC"
      : "display_order ASC, published_date DESC, created_at DESC";

  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME} ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset],
  );
  const [countResult] = await pool.query(
    `SELECT COUNT(*) AS total FROM ${TABLE_NAME} ${whereClause}`,
    params,
  );
  const total = countResult[0].total;
  const pages = Math.ceil(total / safeLimit);

  return {
    rows: rows.map(normalizeNewsRecord),
    total,
    page: safePage,
    limit: safeLimit,
    pages,
  };
};

const getNewsById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
  return normalizeNewsRecord(rows[0]);
};

const getNewsBySlug = async (slug) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME} WHERE slug = ? AND status = 'published'`,
    [slug],
  );
  return normalizeNewsRecord(rows[0]);
};

const getFeaturedNews = async (limit = 5, page = 1) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 5));
  const offset = (safePage - 1) * safeLimit;

  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE_NAME}
     WHERE featured = TRUE AND status = 'published'
     ORDER BY display_order ASC, published_date DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    [safeLimit, offset],
  );

  const [countResult] = await pool.query(
    `SELECT COUNT(*) AS total FROM ${TABLE_NAME} WHERE featured = TRUE AND status = 'published'`,
  );
  const total = countResult[0].total;
  const pages = Math.ceil(total / safeLimit);

  return {
    rows: rows.map(normalizeNewsRecord),
    total,
    page: safePage,
    limit: safeLimit,
    pages,
  };
};

const updateNews = async (id, data) => {
  const existing = await getNewsById(id);
  if (!existing) {
    return null;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const updateData = {};

    if (data.title && data.title !== existing.title) {
      updateData.title = data.title;
      updateData.name = data.title;
      updateData.slug = await resolveUniqueSlug(connection, data.title, id);
    }

    if (data.content !== undefined) updateData.content = data.content;
    if (data.published_date !== undefined) updateData.published_date = data.published_date;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured !== undefined) updateData.featured = data.featured ? 1 : 0;

    if (data.thumbnail_image_url !== undefined) {
      updateData.thumbnail_image_url = data.thumbnail_image_url;
      updateData.image_url = data.thumbnail_image_url;
    }
    if (data.thumbnail_image_key !== undefined) {
      updateData.thumbnail_image_key = data.thumbnail_image_key;
      updateData.image_key = data.thumbnail_image_key;
    }
    if (data.detail_image_url !== undefined) {
      updateData.detail_image_url = data.detail_image_url;
    }
    if (data.detail_image_key !== undefined) {
      updateData.detail_image_key = data.detail_image_key;
    }

    if (Object.keys(updateData).length === 0) {
      await connection.rollback();
      return existing;
    }

    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updateData);

    const [result] = await connection.query(`UPDATE ${TABLE_NAME} SET ${fields} WHERE id = ?`, [
      ...values,
      id,
    ]);

    await connection.commit();

    return result.affectedRows > 0
      ? normalizeNewsRecord({ ...existing, ...updateData })
      : null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteNews = async (id) => {
  const news = await getNewsById(id);
  if (!news) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);

  if (result.affectedRows > 0) {
    return {
      thumbnailImageKey: news.thumbnail_image_key,
      detailImageKey: news.detail_image_key,
    };
  }
  return null;
};

const updateNewsOrder = async (orderedItems) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const item of orderedItems) {
      await connection.query(`UPDATE ${TABLE_NAME} SET display_order = ? WHERE id = ?`, [
        item.display_order,
        item.id,
      ]);
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

const toggleFeatured = async (id) => {
  const news = await getNewsById(id);
  if (!news) {
    return null;
  }

  const newFeaturedValue = !news.featured;
  await updateNews(id, { featured: newFeaturedValue });

  return newFeaturedValue;
};

module.exports = {
  createNews,
  getAllNews,
  getNewsById,
  getNewsBySlug,
  getFeaturedNews,
  updateNews,
  deleteNews,
  updateNewsOrder,
  toggleFeatured,
  generateSlug: slugify,
};
