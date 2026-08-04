const { ensureJournalSchema } = require("./journalSchema");

const createJournalsTables = async () => {
  try {
    console.log("Creating journals tables...\n");

    await ensureJournalSchema();

    console.log("gcs_journals and gcs_journal_entries tables created or already exist");
    process.exit(0);
  } catch (error) {
    console.error("Error creating journals tables:", error.message);
    console.error(error);
    process.exit(1);
  }
};

createJournalsTables();
