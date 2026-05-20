const searchDao = require('../dao/searchDao');
const { ok, error } = require('../utils/responseHandler');

const search = async (req, res) => {
  try {
    const q = (req.query.q || '').trim().substring(0, 100);
    if (!q || q.length < 2) {
      return ok(res, 'Search results', { results: [], total: 0 });
    }
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const data = await searchDao.search(q, limit);
    return ok(res, 'Search results fetched successfully', data);
  } catch (err) {
    console.error('Search error:', err);
    return error(res, 500, 'Internal server error', { details: err.message });
  }
};

module.exports = { search };
