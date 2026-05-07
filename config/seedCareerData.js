const pool = require("./db");
const { generateUniqueSlug } = require("../utils/slug");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const openings = [
  {
    position: "Staff Nurse",
    education: "B.Sc. Nursing / GNM",
    experience: "1–3 years in a hospital setting",
    description: "<p>We are looking for compassionate and skilled Staff Nurses to join our nursing team. The candidate will be responsible for patient care, administering medications, and coordinating with doctors and other healthcare professionals.</p>",
    status: "open",
    department: "Nursing",
    location: "Ahmedabad",
    closing_date: "2026-06-30",
    salary_range: "₹2.5–4 LPA",
  },
  {
    position: "Junior Resident Doctor",
    education: "MBBS from a recognized university",
    experience: "0–2 years; freshers may apply",
    description: "<p>GCS Hospital invites applications from MBBS graduates for the position of Junior Resident Doctor. The role involves patient assessment, ward rounds, assisting senior consultants, and emergency care under supervision.</p>",
    status: "open",
    department: "General Medicine",
    location: "Ahmedabad",
    closing_date: "2026-06-15",
    salary_range: "₹50,000–65,000/month",
  },
  {
    position: "Radiographer",
    education: "B.Sc. / Diploma in Radiography or Medical Imaging Technology",
    experience: "2–4 years in a radiology department",
    description: "<p>We are seeking a qualified Radiographer to operate imaging equipment including X-ray, CT, and MRI machines. The candidate will ensure high-quality diagnostic images and maintain equipment safety standards.</p>",
    status: "open",
    department: "Radiology",
    location: "Ahmedabad",
    closing_date: "2026-07-15",
    salary_range: "₹3–5 LPA",
  },
  {
    position: "Medical Laboratory Technician",
    education: "B.Sc. / Diploma in Medical Laboratory Technology (DMLT)",
    experience: "1–3 years in a clinical laboratory",
    description: "<p>The Medical Laboratory Technician will perform diagnostic tests including haematology, biochemistry, microbiology, and serology. Attention to detail and adherence to lab safety protocols are essential.</p>",
    status: "open",
    department: "Pathology & Laboratory",
    location: "Ahmedabad",
    closing_date: "2026-06-30",
    salary_range: "₹2.5–3.5 LPA",
  },
  {
    position: "Physiotherapist",
    education: "B.P.T. (Bachelor of Physiotherapy); M.P.T. preferred",
    experience: "2–5 years in a hospital or rehabilitation centre",
    description: "<p>We require an experienced Physiotherapist to provide rehabilitation services to patients recovering from orthopaedic, neurological, and post-surgical conditions. The candidate will design and implement individualized treatment plans.</p>",
    status: "open",
    department: "Physiotherapy & Rehabilitation",
    location: "Ahmedabad",
    closing_date: "2026-07-31",
    salary_range: "₹3–5 LPA",
  },
  {
    position: "OT Technician",
    education: "Diploma / B.Sc. in Operation Theatre Technology",
    experience: "2–4 years in a hospital operation theatre",
    description: "<p>The OT Technician will assist surgeons and anaesthesiologists during surgical procedures, manage sterilization of instruments, maintain OT cleanliness, and ensure all equipment is ready before surgery.</p>",
    status: "open",
    department: "Operation Theatre",
    location: "Ahmedabad",
    closing_date: "2026-06-30",
    salary_range: "₹2.5–4 LPA",
  },
  {
    position: "Medical Receptionist / Front Desk Executive",
    education: "Any Graduate; preference to candidates with healthcare administration background",
    experience: "1–3 years in a hospital or clinic reception",
    description: "<p>We are hiring a courteous and organized Front Desk Executive to manage patient registrations, appointment scheduling, insurance documentation, and general enquiries. Proficiency in English, Hindi, and Gujarati is required.</p>",
    status: "open",
    department: "Administration",
    location: "Ahmedabad",
    closing_date: "2026-06-15",
    salary_range: "₹2–3 LPA",
  },
  {
    position: "Accounts Executive",
    education: "B.Com / M.Com; Tally & MS Excel proficiency required",
    experience: "2–4 years; hospital billing experience preferred",
    description: "<p>The Accounts Executive will handle day-to-day accounting entries, patient billing reconciliation, vendor payments, GST filings, and coordination with the finance team. Experience with hospital management software is an advantage.</p>",
    status: "draft",
    department: "Finance & Accounts",
    location: "Ahmedabad",
    closing_date: null,
    salary_range: "₹3–4.5 LPA",
  },
];

const seedCareerData = async () => {
  const connection = await pool.getConnection();
  try {
    console.log("Seeding career openings...\n");

    const [existing] = await connection.query(
      "SELECT position FROM gcs_career_openings",
    );
    const existingPositions = new Set(existing.map((r) => r.position.toLowerCase()));

    let inserted = 0;
    let skipped = 0;

    for (const data of openings) {
      if (existingPositions.has(data.position.toLowerCase())) {
        console.log(`  SKIP  "${data.position}" — already exists`);
        skipped++;
        continue;
      }

      const id = uuidv4();
      const slug = await generateUniqueSlug(connection, "gcs_career_openings", data.position);

      await connection.query(
        `INSERT INTO gcs_career_openings
          (id, slug, position, education, description, experience,
           status, location, department, closing_date, salary_range)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, slug, data.position, data.education, data.description, data.experience,
          data.status, data.location, data.department,
          data.closing_date || null, data.salary_range || null,
        ],
      );
      console.log(`  INSERT "${data.position}" → slug: ${slug}`);
      inserted++;
    }

    console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  } finally {
    connection.release();
  }
};

seedCareerData();
