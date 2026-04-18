const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const JOURNAL_TABLE = "gcs_journals";
const ENTRY_TABLE = "gcs_journal_entries";
const SECTION_ORDER = ["editorial", "original_article", "case_report"];

const groupEntries = (entries) =>
  SECTION_ORDER.reduce((acc, section) => {
    acc[section] = entries
      .filter((item) => item.section === section)
      .sort((a, b) => a.display_order - b.display_order);
    return acc;
  }, {});

const getEntriesByJournalId = async (journalId) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${ENTRY_TABLE} WHERE journal_id = ? ORDER BY section ASC, display_order ASC, created_at ASC`,
    [journalId],
  );
  return rows;
};

const getAllJournals = async () => {
  const [journals] = await pool.query(`SELECT * FROM ${JOURNAL_TABLE} ORDER BY created_at DESC`);
  if (journals.length === 0) {
    return [];
  }

  const [entries] = await pool.query(`SELECT * FROM ${ENTRY_TABLE} ORDER BY section ASC, display_order ASC, created_at ASC`);

  return journals.map((journal) => {
    const journalEntries = entries.filter((item) => item.journal_id === journal.id);
    return {
      ...journal,
      entries: groupEntries(journalEntries),
      entry_counts: {
        editorial: journalEntries.filter((item) => item.section === "editorial").length,
        original_article: journalEntries.filter((item) => item.section === "original_article").length,
        case_report: journalEntries.filter((item) => item.section === "case_report").length,
      },
    };
  });
};

const getJournalById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${JOURNAL_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const entries = await getEntriesByJournalId(id);
  return {
    ...rows[0],
    entries: groupEntries(entries),
  };
};

const createJournal = async (data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const id = uuidv4();
    await connection.query(
      `INSERT INTO ${JOURNAL_TABLE} (id, volume, number, duration, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [id, data.volume, data.number, data.duration, data.created_by || null],
    );

    for (const section of SECTION_ORDER) {
      const items = data.entries[section] || [];
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        await connection.query(
          `INSERT INTO ${ENTRY_TABLE}
            (id, journal_id, section, title, author, pdf_url, pdf_key, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), id, section, item.title, item.author, item.pdf_url, item.pdf_key, index + 1],
        );
      }
    }

    await connection.commit();
    return getJournalById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateJournal = async (id, data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { entries, ...journalFields } = data;
    const fieldEntries = Object.entries(journalFields);

    if (fieldEntries.length > 0) {
      const fields = fieldEntries.map(([key]) => `${key} = ?`).join(", ");
      const values = fieldEntries.map(([, value]) => value);
      await connection.query(`UPDATE ${JOURNAL_TABLE} SET ${fields} WHERE id = ?`, [...values, id]);
    }

    if (entries) {
      await connection.query(`DELETE FROM ${ENTRY_TABLE} WHERE journal_id = ?`, [id]);
      for (const section of SECTION_ORDER) {
        const items = entries[section] || [];
        for (let index = 0; index < items.length; index += 1) {
          const item = items[index];
          await connection.query(
            `INSERT INTO ${ENTRY_TABLE}
              (id, journal_id, section, title, author, pdf_url, pdf_key, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), id, section, item.title, item.author, item.pdf_url, item.pdf_key, index + 1],
          );
        }
      }
    }

    await connection.commit();
    return getJournalById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteJournal = async (id) => {
  const existing = await getJournalById(id);
  if (!existing) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${JOURNAL_TABLE} WHERE id = ?`, [id]);
  if (result.affectedRows === 0) {
    return null;
  }

  return {
    pdfKeys: Object.values(existing.entries).flat().map((item) => item.pdf_key),
  };
};

module.exports = {
  getAllJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal,
};
