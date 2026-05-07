const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);

/**
 * Generates a slug unique within `tableName`.`column`.
 * If `excludeId` is provided, that row's slug is ignored (for updates).
 */
const generateUniqueSlug = async (connection, tableName, sourceText, excludeId = null) => {
  const base = slugify(sourceText) || "item";
  let candidate = base;
  let n = 2;
  while (true) {
    const params = [candidate];
    let sql = `SELECT id FROM ${tableName} WHERE slug = ?`;
    if (excludeId) {
      sql += ` AND id <> ?`;
      params.push(excludeId);
    }
    const [rows] = await connection.query(sql, params);
    if (rows.length === 0) return candidate;
    candidate = `${base}-${n++}`;
  }
};

module.exports = { slugify, generateUniqueSlug };
