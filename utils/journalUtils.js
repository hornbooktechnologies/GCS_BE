const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const abbreviateDuration = (duration) =>
  String(duration || "")
    .replace(/\bjanuary\b/gi, "Jan")
    .replace(/\bfebruary\b/gi, "Feb")
    .replace(/\bmarch\b/gi, "Mar")
    .replace(/\bapril\b/gi, "Apr")
    .replace(/\bjune\b/gi, "Jun")
    .replace(/\bjuly\b/gi, "Jul")
    .replace(/\baugust\b/gi, "Aug")
    .replace(/\bseptember\b/gi, "Sep")
    .replace(/\boctober\b/gi, "Oct")
    .replace(/\bnovember\b/gi, "Nov")
    .replace(/\bdecember\b/gi, "Dec");

const createJournalSlug = (volume, number, duration) =>
  `vol-${slugify(volume)}-no-${slugify(number)}-${slugify(abbreviateDuration(duration))}`;

module.exports = { createJournalSlug };
