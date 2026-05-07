const pool = require("./db");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const downloads = [
  {
    title: "GCS Hospital - Health Check-Up",
    image_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCS-Hospital-Health-Check-Up-Brochure.jpg",
    pdf_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCS-Hospital-Health-Check-Up-Brochure.pdf",
  },
  {
    title: "GCS Hospital - IVF Clinic",
    image_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCS-Hospital-IVF-Clinic-Brochure.jpg",
    pdf_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCS-Hospital-IVF-Clinic-Brochure.pdf",
  },
  {
    title: "GCS Hospital - Services",
    image_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCS-Hospital-Services-Brochure.jpg",
    pdf_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCS-Hospital-Services-Brochure.pdf",
  },
  {
    title: "GCS Hospital - Special Wing",
    image_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCS-Hospital-Special-Wing-Brochure.jpg",
    pdf_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCS-Hospital-Special-Wing-Brochure.pdf",
  },
  {
    title: "GCSMCH RC - 10 Year Journey @ 2020",
    image_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCSMCH-RC-10-Year-Journey-@-2020.jpg",
    pdf_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCSMCH-RC-10-Year-Journey-@-2020.pdf",
  },
  {
    title: "GCSMCH RC - Organization",
    image_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCSMCH-RC-Organization-Brochure.jpg",
    pdf_url:
      "https://www.gcsmc.org/assets/pdf/downloads/GCSMCH-RC-Organization-Brochure.pdf",
  },
  {
    title: "GCS Hospital - Delivery Packages",
    image_url:
      "https://www.gcsmc.org/assets/pdf/downloads/Gynec-Delivery-Packages.jpg",
    pdf_url:
      "https://www.gcsmc.org/assets/pdf/downloads/Gynec-Delivery-Packages.pdf",
  },
  {
    title: "GCS Hospital - ICU Packages",
    image_url:
      "https://www.gcsmc.org/assets/pdf/downloads/ICU-Packages.jpg",
    pdf_url:
      "https://www.gcsmc.org/assets/pdf/downloads/ICU-Packages.pdf",
  },
];

function toLegacyKey(url) {
  return `legacy-external:${url}`;
}

const seedDownloadsData = async () => {
  const connection = await pool.getConnection();
  try {
    console.log("Seeding download resources from legacy site...\n");

    let inserted = 0;
    let updated = 0;

    for (const item of downloads) {
      const [rows] = await connection.query(
        `SELECT id FROM gcs_downloads WHERE LOWER(title) = LOWER(?) OR pdf_url = ? LIMIT 1`,
        [item.title, item.pdf_url],
      );

      if (rows.length > 0) {
        await connection.query(
          `UPDATE gcs_downloads
              SET title = ?, image_url = ?, image_key = ?, pdf_url = ?, pdf_key = ?
            WHERE id = ?`,
          [
            item.title,
            item.image_url,
            toLegacyKey(item.image_url),
            item.pdf_url,
            toLegacyKey(item.pdf_url),
            rows[0].id,
          ],
        );
        console.log(`  UPDATE "${item.title}"`);
        updated++;
        continue;
      }

      await connection.query(
        `INSERT INTO gcs_downloads
          (id, title, image_url, image_key, pdf_url, pdf_key, created_by)
         VALUES (?, ?, ?, ?, ?, ?, NULL)`,
        [
          uuidv4(),
          item.title,
          item.image_url,
          toLegacyKey(item.image_url),
          item.pdf_url,
          toLegacyKey(item.pdf_url),
        ],
      );
      console.log(`  INSERT "${item.title}"`);
      inserted++;
    }

    console.log(`\nDone. ${inserted} inserted, ${updated} updated.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  } finally {
    connection.release();
  }
};

seedDownloadsData();
