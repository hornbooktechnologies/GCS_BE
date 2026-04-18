const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const journalDao = require("../dao/journalDao");
const { ok, created, error } = require("../utils/responseHandler");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const SECTION_DEFS = [
  { key: "editorial", field: "editorial_pdfs" },
  { key: "original_article", field: "original_article_pdfs" },
  { key: "case_report", field: "case_report_pdfs" },
];

const deleteS3Object = async (key) => {
  if (!key) return;
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }),
  );
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim());
  }
  if (typeof value === "string") {
    return [value.trim()];
  }
  return [];
};

const buildEntriesFromRequest = (body, files) => {
  const result = {};

  for (const sectionDef of SECTION_DEFS) {
    const titles = normalizeArray(body[`${sectionDef.key}_titles`]).filter(Boolean);
    const authors = normalizeArray(body[`${sectionDef.key}_authors`]).filter(Boolean);
    const pdfs = files?.[sectionDef.field] || [];

    if (titles.length === 0 || authors.length === 0 || pdfs.length === 0) {
      throw new Error(`At least one complete ${sectionDef.key.replace(/_/g, " ")} item is required`);
    }

    if (titles.length !== authors.length || titles.length !== pdfs.length) {
      throw new Error(`Mismatched ${sectionDef.key.replace(/_/g, " ")} items`);
    }

    result[sectionDef.key] = titles.map((title, index) => ({
      title,
      author: authors[index],
      pdf_url: pdfs[index].location,
      pdf_key: pdfs[index].key,
    }));
  }

  return result;
};

const parseUpdateEntries = (body, files, existing) => {
  if (!body.entries_payload) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(body.entries_payload);
  } catch (err) {
    throw new Error("Invalid journal entries payload");
  }

  const existingEntries = existing?.entries || {};
  const incomingFiles = files || {};
  const result = {};

  for (const sectionDef of SECTION_DEFS) {
    const items = Array.isArray(payload[sectionDef.key]) ? payload[sectionDef.key] : [];
    if (items.length === 0) {
      throw new Error(`At least one ${sectionDef.key.replace(/_/g, " ")} item is required`);
    }

    const newPdfs = incomingFiles[sectionDef.field] || [];
    let newPdfIndex = 0;

    result[sectionDef.key] = items.map((item, index) => {
      const title = String(item.title || "").trim();
      const author = String(item.author || "").trim();

      if (!title || !author) {
        throw new Error(`Title and author are required for ${sectionDef.key.replace(/_/g, " ")} item ${index + 1}`);
      }

      if (item.keepExisting && item.id) {
        const matched = (existingEntries[sectionDef.key] || []).find((entry) => entry.id === item.id);
        if (!matched) {
          throw new Error(`Existing PDF not found for ${sectionDef.key.replace(/_/g, " ")} item ${index + 1}`);
        }
        return {
          title,
          author,
          pdf_url: matched.pdf_url,
          pdf_key: matched.pdf_key,
        };
      }

      const uploaded = newPdfs[newPdfIndex];
      newPdfIndex += 1;
      if (!uploaded) {
        throw new Error(`PDF is required for ${sectionDef.key.replace(/_/g, " ")} item ${index + 1}`);
      }

      return {
        title,
        author,
        pdf_url: uploaded.location,
        pdf_key: uploaded.key,
      };
    });

    if (newPdfIndex !== newPdfs.length) {
      throw new Error(`Unused uploaded PDFs found for ${sectionDef.key.replace(/_/g, " ")}`);
    }
  }

  return result;
};

const createJournal = async (req, res) => {
  try {
    const { volume, number, duration } = req.body;
    if (!volume || !number || !duration) {
      return error(res, 400, "Volume, number, and duration are required", {
        code: "MISSING_FIELDS",
      });
    }

    let entries;
    try {
      entries = buildEntriesFromRequest(req.body, req.files);
    } catch (buildErr) {
      return error(res, 400, buildErr.message, { code: "INVALID_DATA" });
    }

    const journal = await journalDao.createJournal({
      volume: volume.trim(),
      number: number.trim(),
      duration: duration.trim(),
      entries,
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Journal created successfully", journal);
  } catch (err) {
    console.error("Create journal error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllJournals = async (req, res) => {
  try {
    const journals = await journalDao.getAllJournals();
    return ok(res, "Journals fetched successfully", { journals });
  } catch (err) {
    console.error("Get journals error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getJournalById = async (req, res) => {
  try {
    const journal = await journalDao.getJournalById(req.params.id);
    if (!journal) {
      return error(res, 404, "Journal not found");
    }
    return ok(res, "Journal fetched successfully", journal);
  } catch (err) {
    console.error("Get journal error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateJournal = async (req, res) => {
  try {
    const existing = await journalDao.getJournalById(req.params.id);
    if (!existing) {
      return error(res, 404, "Journal not found");
    }

    const updateData = {};
    if (req.body.volume !== undefined) {
      if (!req.body.volume.trim()) {
        return error(res, 400, "Volume is required", { code: "MISSING_FIELDS" });
      }
      updateData.volume = req.body.volume.trim();
    }
    if (req.body.number !== undefined) {
      if (!req.body.number.trim()) {
        return error(res, 400, "Number is required", { code: "MISSING_FIELDS" });
      }
      updateData.number = req.body.number.trim();
    }
    if (req.body.duration !== undefined) {
      if (!req.body.duration.trim()) {
        return error(res, 400, "Duration is required", { code: "MISSING_FIELDS" });
      }
      updateData.duration = req.body.duration.trim();
    }

    if (req.body.entries_payload !== undefined) {
      try {
        updateData.entries = parseUpdateEntries(req.body, req.files, existing);
      } catch (buildErr) {
        return error(res, 400, buildErr.message, { code: "INVALID_DATA" });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    const previousPdfKeys = Object.values(existing.entries || {}).flat().map((item) => item.pdf_key);
    const updatedJournal = await journalDao.updateJournal(req.params.id, updateData);

    if (updateData.entries) {
      const nextPdfKeys = Object.values(updateData.entries).flat().map((item) => item.pdf_key);
      const removedPdfKeys = previousPdfKeys.filter((key) => !nextPdfKeys.includes(key));
      for (const key of removedPdfKeys) {
        try {
          await deleteS3Object(key);
        } catch (s3Err) {
          console.error("Error deleting replaced journal PDF from S3:", s3Err);
        }
      }
    }

    return ok(res, "Journal updated successfully", updatedJournal);
  } catch (err) {
    console.error("Update journal error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteJournal = async (req, res) => {
  try {
    const result = await journalDao.deleteJournal(req.params.id);
    if (!result) {
      return error(res, 404, "Journal not found");
    }

    for (const key of result.pdfKeys) {
      try {
        await deleteS3Object(key);
      } catch (s3Err) {
        console.error("Error deleting journal PDF from S3:", s3Err);
      }
    }

    return ok(res, "Journal deleted successfully");
  } catch (err) {
    console.error("Delete journal error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createJournal,
  getAllJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
};
