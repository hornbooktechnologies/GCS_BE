const pool = require('../config/db');
const STATIC_PAGES = require('./staticPagesIndex');

function stripHtml(text) {
  if (!text) return '';
  return String(text).replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function extractSnippet(text, keyword, maxLength = 160) {
  const plain = stripHtml(text);
  if (!plain) return '';
  const lower = plain.toLowerCase();
  const kw = keyword.toLowerCase();
  const idx = lower.indexOf(kw);
  if (idx === -1) {
    return plain.length > maxLength ? plain.slice(0, maxLength).trim() + '...' : plain;
  }
  const start = Math.max(0, idx - 60);
  const end = Math.min(plain.length, start + maxLength);
  const slice = plain.slice(start, end).trim();
  return (start > 0 ? '...' : '') + slice + (end < plain.length ? '...' : '');
}

function scoreResult(title, subtitle, body, keyword) {
  const kw = keyword.toLowerCase();
  const t = (title || '').toLowerCase();
  const s = (subtitle || '').toLowerCase();
  const b = stripHtml(body || '').toLowerCase();
  if (t.startsWith(kw)) return 30;
  if (t.includes(kw)) return 20;
  if (s.includes(kw)) return 10;
  if (b.includes(kw)) return 5;
  return 1;
}

async function searchBlogs(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, title, description, author_name, category, slug
     FROM gcs_blogs
     WHERE title LIKE ? OR description LIKE ? OR author_name LIKE ? OR category LIKE ?
     LIMIT ?`,
    [like, like, like, like, limit]
  );
  return rows.map((r) => ({
    type: 'blog',
    title: r.title,
    snippet: extractSnippet(r.description, term),
    url: `/blog/${r.slug}`,
    relevance_score: scoreResult(r.title, r.category, r.description, term),
  }));
}

async function searchDoctors(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, name, designation, description, slug
     FROM gcs_doctors
     WHERE name LIKE ? OR designation LIKE ? OR description LIKE ?
     LIMIT ?`,
    [like, like, like, limit]
  );
  return rows.map((r) => ({
    type: 'doctor',
    title: r.name,
    snippet: extractSnippet(r.description, term) || r.designation || '',
    url: `/doctors/${r.slug}`,
    relevance_score: scoreResult(r.name, r.designation, r.description, term),
  }));
}

async function searchSpecialities(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, title, sub_description, description, category, slug
     FROM gcs_specialities
     WHERE title LIKE ? OR sub_description LIKE ? OR description LIKE ? OR category LIKE ?
     LIMIT ?`,
    [like, like, like, like, limit]
  );
  return rows.map((r) => {
    const base = r.category === 'super' ? '/hospital/super-specialties' : '/hospital/general-specialties';
    return {
      type: 'speciality',
      title: r.title,
      snippet: extractSnippet(r.sub_description || r.description, term),
      url: `${base}/${r.slug}`,
      relevance_score: scoreResult(r.title, r.category, r.sub_description || r.description, term),
    };
  });
}

async function searchNews(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, COALESCE(title, name) AS title, content, slug
     FROM gcs_news
     WHERE status = 'published'
       AND (COALESCE(title, name) LIKE ? OR content LIKE ?)
     LIMIT ?`,
    [like, like, limit]
  );
  return rows.map((r) => ({
    type: 'news',
    title: r.title,
    snippet: extractSnippet(r.content, term),
    url: `/news/${r.slug}`,
    relevance_score: scoreResult(r.title, null, r.content, term),
  }));
}

async function searchSymptoms(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, name, subtitle
     FROM gcs_sympotms
     WHERE name LIKE ? OR subtitle LIKE ?
     LIMIT ?`,
    [like, like, limit]
  );
  return rows.map((r) => ({
    type: 'symptom',
    title: r.name,
    snippet: r.subtitle || '',
    url: '/unsure-of-the-speciality',
    relevance_score: scoreResult(r.name, r.subtitle, null, term),
  }));
}

async function searchAnnouncements(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, title, category
     FROM gcs_announcements
     WHERE title LIKE ? OR category LIKE ?
     LIMIT ?`,
    [like, like, limit]
  );
  return rows.map((r) => ({
    type: 'announcement',
    title: r.title,
    snippet: r.category ? `Category: ${r.category}` : '',
    url: '/announcements',
    relevance_score: scoreResult(r.title, r.category, null, term),
  }));
}

async function searchAwards(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, name, description
     FROM gcs_awards
     WHERE name LIKE ? OR description LIKE ?
     LIMIT ?`,
    [like, like, limit]
  );
  return rows.map((r) => ({
    type: 'award',
    title: r.name,
    snippet: extractSnippet(r.description, term),
    url: '/awards-accolades',
    relevance_score: scoreResult(r.name, null, r.description, term),
  }));
}

async function searchFacilities(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, title
     FROM gcs_facilities
     WHERE title LIKE ?
     LIMIT ?`,
    [like, limit]
  );
  return rows.map((r) => ({
    type: 'facility',
    title: r.title,
    snippet: '',
    url: '/hospital-facilities',
    relevance_score: scoreResult(r.title, null, null, term),
  }));
}

async function searchTeam(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, name, subtitle, short_description
     FROM gcs_team_members
     WHERE name LIKE ? OR subtitle LIKE ? OR short_description LIKE ?
     LIMIT ?`,
    [like, like, like, limit]
  );
  return rows.map((r) => ({
    type: 'team',
    title: r.name,
    snippet: extractSnippet(r.short_description || r.subtitle, term),
    url: `/meet-the-team/${r.id}`,
    relevance_score: scoreResult(r.name, r.subtitle, r.short_description, term),
  }));
}

async function searchCampusLife(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, title
     FROM gcs_campus_life
     WHERE title LIKE ?
     LIMIT ?`,
    [like, limit]
  );
  return rows.map((r) => ({
    type: 'campus-life',
    title: r.title,
    snippet: '',
    url: '/campus-life',
    relevance_score: scoreResult(r.title, null, null, term),
  }));
}

async function searchEvents(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, title, description, place
     FROM gcs_events
     WHERE title LIKE ? OR description LIKE ? OR place LIKE ?
     LIMIT ?`,
    [like, like, like, limit]
  );
  return rows.map((r) => ({
    type: 'event',
    title: r.title,
    snippet: extractSnippet(r.description, term) || (r.place ? `At ${r.place}` : ''),
    url: '/events-activities',
    relevance_score: scoreResult(r.title, r.place, r.description, term),
  }));
}

async function searchSchemes(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, scheme_name AS title, badge_text, description, free_opd_specialities, empanelled_specialities
     FROM gcs_government_schemes
     WHERE scheme_name LIKE ? OR badge_text LIKE ? OR description LIKE ?
       OR free_opd_specialities LIKE ? OR empanelled_specialities LIKE ?
     LIMIT ?`,
    [like, like, like, like, like, limit]
  );
  return rows.map((r) => ({
    type: 'government-scheme',
    title: r.title,
    snippet: extractSnippet(r.description, term) || r.badge_text || '',
    url: '/government-schemes',
    relevance_score: scoreResult(r.title, r.badge_text, r.description, term),
  }));
}

function searchStaticPages(term, limit) {
  const kw = term.toLowerCase();
  const matches = [];
  for (const page of STATIC_PAGES) {
    const titleLower = page.title.toLowerCase();
    const snippetLower = page.snippet.toLowerCase();
    const keywordHit = page.keywords.some((k) => k.includes(kw) || kw.includes(k));
    const titleHit = titleLower.includes(kw);
    const snippetHit = snippetLower.includes(kw);
    if (!titleHit && !snippetHit && !keywordHit) continue;
    let score;
    if (titleLower.startsWith(kw)) score = 30;
    else if (titleHit) score = 20;
    else if (keywordHit) score = 15;
    else score = 5;
    matches.push({
      type: 'page',
      title: page.title,
      snippet: extractSnippet(page.snippet, term),
      url: page.url,
      relevance_score: score,
    });
    if (matches.length >= limit) break;
  }
  return Promise.resolve(matches);
}

async function searchNursingGallery(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, name
     FROM gcs_nursing_photo_gallery
     WHERE name LIKE ?
     LIMIT ?`,
    [like, limit]
  );
  return rows.map((r) => ({
    type: 'nursing-gallery',
    title: r.name,
    snippet: '',
    url: '/nsc-overview',
    relevance_score: scoreResult(r.name, null, null, term),
  }));
}

async function searchJournals(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT je.id, je.title, je.author, j.volume, j.duration
     FROM gcs_journal_entries je
     INNER JOIN gcs_journals j ON j.id = je.journal_id
     WHERE je.title LIKE ? OR je.author LIKE ?
     LIMIT ?`,
    [like, like, limit]
  );
  return rows.map((r) => ({
    type: 'journal',
    title: r.title,
    snippet: `By ${r.author || 'Unknown'} — Volume ${r.volume}, ${r.duration}`,
    url: '/gcsmc-journal-of-medical-sciences',
    relevance_score: scoreResult(r.title, r.author, null, term),
  }));
}

async function searchDownloads(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, title
     FROM gcs_downloads
     WHERE title LIKE ?
     LIMIT ?`,
    [like, limit]
  );
  return rows.map((r) => ({
    type: 'download',
    title: r.title,
    snippet: '',
    url: '/downloads',
    relevance_score: scoreResult(r.title, null, null, term),
  }));
}

async function searchNewsletters(term, limit) {
  const like = `%${term}%`;
  const [rows] = await pool.query(
    `SELECT id, title, year
     FROM gcs_newsletters
     WHERE title LIKE ? OR CAST(year AS CHAR) LIKE ?
     LIMIT ?`,
    [like, like, limit]
  );
  return rows.map((r) => ({
    type: 'newsletter',
    title: r.title,
    snippet: r.year ? `Year: ${r.year}` : '',
    url: '/newsletter',
    relevance_score: scoreResult(r.title, null, null, term),
  }));
}

async function search(term, limit = 20) {
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const perTypeLimit = Math.max(3, Math.ceil(safeLimit / 3));

  const results = await Promise.allSettled([
    searchBlogs(term, perTypeLimit),
    searchDoctors(term, perTypeLimit),
    searchSpecialities(term, perTypeLimit),
    searchNews(term, perTypeLimit),
    searchSymptoms(term, perTypeLimit),
    searchAnnouncements(term, perTypeLimit),
    searchAwards(term, perTypeLimit),
    searchFacilities(term, perTypeLimit),
    searchTeam(term, perTypeLimit),
    searchCampusLife(term, perTypeLimit),
    searchEvents(term, perTypeLimit),
    searchSchemes(term, perTypeLimit),
    searchJournals(term, perTypeLimit),
    searchDownloads(term, perTypeLimit),
    searchNewsletters(term, perTypeLimit),
    searchNursingGallery(term, perTypeLimit),
    searchStaticPages(term, perTypeLimit),
  ]);

  const combined = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      combined.push(...result.value);
    }
  }

  combined.sort((a, b) => b.relevance_score - a.relevance_score);

  return {
    results: combined.slice(0, safeLimit),
    total: combined.length,
  };
}

module.exports = { search };
