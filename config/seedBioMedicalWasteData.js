const { v4: uuidv4 } = require("uuid");
const pool = require("./db");
const seedRecords = require("./bioMedicalWasteSeedData");

const calculateTotal = (record) =>
  Math.round(
    [record.red_kg, record.yellow_kg, record.blue_kg, record.white_kg]
      .reduce((sum, value) => sum + Number(value || 0), 0) * 1000,
  ) / 1000;

const seedBioMedicalWasteData = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const values = seedRecords.map((record) => [
      uuidv4(),
      record.report_year,
      record.report_month,
      record.red_kg,
      record.yellow_kg,
      record.blue_kg,
      record.white_kg,
      calculateTotal(record),
      "published",
      "Migrated from the legacy public report",
      null,
    ]);

    const [result] = await connection.query(
      `INSERT IGNORE INTO gcs_bio_medical_waste
        (id, report_year, report_month, red_kg, yellow_kg, blue_kg, white_kg,
         total_kg, status, notes, created_by)
       VALUES ?`,
      [values],
    );

    const [summaryRows] = await connection.query(`
      SELECT COUNT(*) AS record_count,
             MIN(report_year) AS first_year,
             MAX(report_year) AS latest_year,
             SUM(status = 'published') AS published_count
      FROM gcs_bio_medical_waste
    `);

    await connection.commit();
    const summary = summaryRows[0];
    console.log(
      `Biomedical waste seed complete: ${result.affectedRows} inserted, ` +
        `${values.length - result.affectedRows} already existed.`,
    );
    console.log(
      `Database now contains ${summary.record_count} records ` +
        `(${summary.first_year}-${summary.latest_year}); ` +
        `${summary.published_count} published.`,
    );
  } catch (err) {
    await connection.rollback();
    console.error("Failed to seed biomedical waste data:", err);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
};

seedBioMedicalWasteData();

