const { v4: uuidv4 } = require("uuid");
const pool = require("./db");
const { generateUniqueSlug } = require("../utils/slug");
require("dotenv").config();

const SPECIALITY_TABLE = "gcs_specialities";
const MAIN_BANNER_TABLE = "gcs_speciality_main_banners";
const SERVICES_TABLE = "gcs_speciality_services";
const DOCTOR_TABLE = "gcs_doctors";
const DOCTOR_SPECIALITY_TABLE = "gcs_doctor_specialities";

const specialitySeedData = [
  {
    title: "Anesthesiology",
    category: "general",
    top_banner_url: "/images/anesthesia.jpg",
    top_banner_key: "/images/anesthesia.jpg",
    sub_description:
      "Providing comprehensive perioperative care, pain management, and critical support during surgical procedures with state-of-the-art monitoring and expert clinical judgment.",
    description:
      "<p>Our Department of Anesthesiology assists patients with pre-operative care, to give relief from pain during surgeries, for both small and complex open surgeries.</p><p>We have an expert and experienced team of anesthesiologists with the help of trained nurse anesthetists for surgical procedures, intensive care, and pain management. All the operation theatres have state-of-the-art facilities to deal with any emergency.</p>",
    brochure_url: "/images/anesthesia.jpg",
    brochure_key: "/images/anesthesia.jpg",
    brochure_type: "image",
    main_banners: ["/images/anesthesia.jpg"],
    services_intro:
      "Several types of anesthesia are available, including general anesthesia, spinal anesthesia, and local anesthesia. The type of anesthesia that is chosen is based on the pre-anesthesia checkup, the planned operation or procedure, and the patient's choice.",
    services_heading:
      "An expert team of Anesthesiologists to conduct critical surgeries such as:",
    services: [
      "Advanced Laparoscopic Surgery",
      "Obstetrics and Gynecology surgery",
      "Labor Analgesia- (Painless delivery with walking epidural)",
      "USG (Ultrasonography) guided peripheral nerve blocks.",
      "Orthopedics",
      "ENT (Ear, Nose, and Throat)",
      "Ophthalmology",
      "Neurosurgery",
      "Pediatric Surgery",
      "Thoracic and Vascular Surgery",
      "Gastro-Intestinal Surgery",
      "Urology",
      "Joint Replacement",
      "Plastic & Cosmetic / Maxillofacial Surgery",
      "Pain Management Service",
      "State of the Art Techniques",
      "Clinical Anesthesia",
      "Intensive Care",
      "Resuscitology Simulation Training",
    ],
  },
  {
    title: "General Medicine",
    category: "general",
    top_banner_url: "/images/medicine.jpg",
    top_banner_key: "/images/medicine.jpg",
    sub_description: "Expert diagnostic and primary care for complex medical conditions.",
    description:
      "<p>General Medicine at GCS Hospital.</p><p>Expert diagnostic and primary care for complex medical conditions.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/medicine.jpg",
    brochure_key: "/images/medicine.jpg",
    brochure_type: "image",
    main_banners: ["/images/medicine.jpg"],
  },
  {
    title: "Orthopaedics",
    category: "general",
    top_banner_url: "/images/jointPain.png",
    top_banner_key: "/images/jointPain.png",
    sub_description: "Comprehensive joint, bone, and trauma care excellence.",
    description:
      "<p>Orthopaedics at GCS Hospital.</p><p>Comprehensive joint, bone, and trauma care excellence.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/jointPain.png",
    brochure_key: "/images/jointPain.png",
    brochure_type: "image",
    main_banners: ["/images/jointPain.png"],
  },
  {
    title: "Ophthalmology",
    category: "general",
    top_banner_url: "/images/eyeIssue.png",
    top_banner_key: "/images/eyeIssue.png",
    sub_description: "Advanced eye care and surgical vision correction.",
    description:
      "<p>Ophthalmology at GCS Hospital.</p><p>Advanced eye care and surgical vision correction.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/eyeIssue.png",
    brochure_key: "/images/eyeIssue.png",
    brochure_type: "image",
    main_banners: ["/images/eyeIssue.png"],
  },
  {
    title: "Ob-Gyn",
    category: "general",
    top_banner_url: "/images/obstetrics-gynecology.jpg",
    top_banner_key: "/images/obstetrics-gynecology.jpg",
    sub_description: "Compassionate care for womens health and maternity.",
    description:
      "<p>Ob-Gyn at GCS Hospital.</p><p>Compassionate care for womens health and maternity.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/obstetrics-gynecology.jpg",
    brochure_key: "/images/obstetrics-gynecology.jpg",
    brochure_type: "image",
    main_banners: ["/images/obstetrics-gynecology.jpg"],
  },
  {
    title: "Paediatrics",
    category: "general",
    top_banner_url: "/images/highFever.png",
    top_banner_key: "/images/highFever.png",
    sub_description: "Child-centric medical care from neonatal to adolescent stages.",
    description:
      "<p>Paediatrics at GCS Hospital.</p><p>Child-centric medical care from neonatal to adolescent stages.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/highFever.png",
    brochure_key: "/images/highFever.png",
    brochure_type: "image",
    main_banners: ["/images/highFever.png"],
  },
  {
    title: "ENT",
    category: "general",
    top_banner_url: "/images/ent.jpg",
    top_banner_key: "/images/ent.jpg",
    sub_description: "Ear, Nose, and Throat specialisation.",
    description:
      "<p>ENT at GCS Hospital.</p><p>Ear, Nose, and Throat specialisation.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/ent.jpg",
    brochure_key: "/images/ent.jpg",
    brochure_type: "image",
    main_banners: ["/images/ent.jpg"],
  },
  {
    title: "Dermatology",
    category: "general",
    top_banner_url: "/images/logo.png",
    top_banner_key: "/images/logo.png",
    sub_description: "Skin health and aesthetic treatments.",
    description:
      "<p>Dermatology at GCS Hospital.</p><p>Skin health and aesthetic treatments.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/logo.png",
    brochure_key: "/images/logo.png",
    brochure_type: "image",
    main_banners: ["/images/logo.png"],
  },
  {
    title: "Psychiatry",
    category: "general",
    top_banner_url: "/images/logo.png",
    top_banner_key: "/images/logo.png",
    sub_description: "Mental health and wellness care.",
    description:
      "<p>Psychiatry at GCS Hospital.</p><p>Mental health and wellness care.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/logo.png",
    brochure_key: "/images/logo.png",
    brochure_type: "image",
    main_banners: ["/images/logo.png"],
  },
  {
    title: "Dentistry",
    category: "general",
    top_banner_url: "/images/dentistry.jpg",
    top_banner_key: "/images/dentistry.jpg",
    sub_description: "Oral health and dental surgery.",
    description:
      "<p>Dentistry at GCS Hospital.</p><p>Oral health and dental surgery.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/dentistry.jpg",
    brochure_key: "/images/dentistry.jpg",
    brochure_type: "image",
    main_banners: ["/images/dentistry.jpg"],
  },
  {
    title: "Cardiology",
    category: "super",
    top_banner_url: "/images/chestPain.png",
    top_banner_key: "/images/chestPain.png",
    sub_description: "Non-invasive, interventional and cardiac surgery excellence.",
    description:
      "<p>Cardiology at GCS Hospital.</p><p>Non-invasive, interventional and cardiac surgery excellence.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/chestPain.png",
    brochure_key: "/images/chestPain.png",
    brochure_type: "image",
    main_banners: ["/images/chestPain.png"],
  },
  {
    title: "Neurology",
    category: "super",
    top_banner_url: "/images/neuro-medicine.jpg",
    top_banner_key: "/images/neuro-medicine.jpg",
    sub_description: "Advanced brain, spine, and nervous system diagnostics.",
    description:
      "<p>Neurology at GCS Hospital.</p><p>Advanced brain, spine, and nervous system diagnostics.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/neuro-medicine.jpg",
    brochure_key: "/images/neuro-medicine.jpg",
    brochure_type: "image",
    main_banners: ["/images/neuro-medicine.jpg"],
  },
  {
    title: "Oncology",
    category: "super",
    top_banner_url: "/images/oncology.jpg",
    top_banner_key: "/images/oncology.jpg",
    sub_description: "Comprehensive cancer care with multidisciplinary approach.",
    description:
      "<p>Oncology at GCS Hospital.</p><p>Comprehensive cancer care with multidisciplinary approach.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/oncology.jpg",
    brochure_key: "/images/oncology.jpg",
    brochure_type: "image",
    main_banners: ["/images/oncology.jpg"],
  },
  {
    title: "Nephrology",
    category: "super",
    top_banner_url: "/images/nephrology.jpg",
    top_banner_key: "/images/nephrology.jpg",
    sub_description: "Expert care for kidney diseases and dialysis services.",
    description:
      "<p>Nephrology at GCS Hospital.</p><p>Expert care for kidney diseases and dialysis services.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/nephrology.jpg",
    brochure_key: "/images/nephrology.jpg",
    brochure_type: "image",
    main_banners: ["/images/nephrology.jpg"],
  },
  {
    title: "Urology",
    category: "super",
    top_banner_url: "/images/urology-service.jpg",
    top_banner_key: "/images/urology-service.jpg",
    sub_description: "Specialized care for urinary tract and male reproductive system.",
    description:
      "<p>Urology at GCS Hospital.</p><p>Specialized care for urinary tract and male reproductive system.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/urology-service.jpg",
    brochure_key: "/images/urology-service.jpg",
    brochure_type: "image",
    main_banners: ["/images/urology-service.jpg"],
  },
  {
    title: "Gastroenterology",
    category: "super",
    top_banner_url: "/images/gastroenterology.jpg",
    top_banner_key: "/images/gastroenterology.jpg",
    sub_description: "Treatment for digestive system and liver disorders.",
    description:
      "<p>Gastroenterology at GCS Hospital.</p><p>Treatment for digestive system and liver disorders.</p><p>This record was seeded from the existing frontend static home page data so it can now be managed from the admin panel and reflected on the website.</p>",
    brochure_url: "/images/gastroenterology.jpg",
    brochure_key: "/images/gastroenterology.jpg",
    brochure_type: "image",
    main_banners: ["/images/gastroenterology.jpg"],
  },
];

const doctorSeedData = [
  { name: "Dr. Bipin K. Shah", designation: "Professor & HOD", experience: 24, is_hod: true, display_order: 0, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Heena S. Chhanwal", designation: "Professor", experience: 20, is_hod: false, display_order: 1, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Asmita V. Chudhary", designation: "Professor", experience: 15, is_hod: false, display_order: 2, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Kinjal S. Sanghvi", designation: "Associate Professor", experience: 15, is_hod: false, display_order: 3, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Deepa N. Jadav", designation: "Associate Professor", experience: 9, is_hod: false, display_order: 4, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Divya N. Kheskani", designation: "Associate Professor", experience: 6, is_hod: false, display_order: 5, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Ankita Y. Patel", designation: "Assistant Professor", experience: 7, is_hod: false, display_order: 6, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Carolin Smita A. Kerketta", designation: "Assistant Professor", experience: 5, is_hod: false, display_order: 7, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Sejal R. Parmar", designation: "Assistant Professor", experience: 5, is_hod: false, display_order: 8, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Devanshi I. Shah", designation: "Assistant Professor", experience: 2, is_hod: false, display_order: 9, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Shruti Desai", designation: "Assistant Professor", experience: 3, is_hod: false, display_order: 10, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Henal Jethi", designation: "Assistant Professor", experience: 4, is_hod: false, display_order: 11, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Bhakti Jain", designation: "Assistant Professor", experience: 4, is_hod: false, display_order: 12, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Nimisha A. Tank", designation: "Assistant Professor", experience: 6, is_hod: false, display_order: 13, speciality_titles: ["Anesthesiology"] },
  { name: "Dr. Ankit Mehta", designation: "Consultant Physician", experience: 14, is_hod: true, display_order: 0, speciality_titles: ["General Medicine"] },
  { name: "Dr. Riddhi Patel", designation: "Consultant Orthopaedic Surgeon", experience: 11, is_hod: true, display_order: 0, speciality_titles: ["Orthopaedics"] },
  { name: "Dr. Pooja Trivedi", designation: "Consultant Ophthalmologist", experience: 10, is_hod: true, display_order: 0, speciality_titles: ["Ophthalmology"] },
  { name: "Dr. Meera Shah", designation: "Consultant Obstetrician & Gynecologist", experience: 13, is_hod: true, display_order: 0, speciality_titles: ["Ob-Gyn"] },
  { name: "Dr. Nilesh Desai", designation: "Consultant Cardiologist", experience: 16, is_hod: true, display_order: 0, speciality_titles: ["Cardiology"] },
  { name: "Dr. Karan Vyas", designation: "Consultant Neurologist", experience: 12, is_hod: true, display_order: 0, speciality_titles: ["Neurology"] },
  { name: "Dr. Aditi Joshi", designation: "Consultant Oncologist", experience: 9, is_hod: false, display_order: 1, speciality_titles: ["Oncology"] },
  { name: "Dr. Saurabh Modi", designation: "Consultant Nephrologist", experience: 12, is_hod: false, display_order: 1, speciality_titles: ["Nephrology"] },
  { name: "Dr. Harsh Shah", designation: "Consultant Gastroenterologist", experience: 11, is_hod: false, display_order: 1, speciality_titles: ["Gastroenterology"] },
  { name: "Dr. Devang Trivedi", designation: "Consultant Urologist", experience: 10, is_hod: false, display_order: 1, speciality_titles: ["Urology"] },
];

const ensureTableExists = async (connection, tableName) => {
  const [rows] = await connection.query(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [process.env.DB_NAME, tableName],
  );

  if (rows.length === 0) {
    throw new Error(`Required table ${tableName} does not exist`);
  }
};

const getSpecialityByTitle = async (connection, title) => {
  const [rows] = await connection.query(
    `SELECT id, title, slug FROM ${SPECIALITY_TABLE} WHERE title = ? LIMIT 1`,
    [title],
  );
  return rows[0] || null;
};

const getDoctorByName = async (connection, name) => {
  const [rows] = await connection.query(
    `SELECT id, name FROM ${DOCTOR_TABLE} WHERE name = ? LIMIT 1`,
    [name],
  );
  return rows[0] || null;
};

const upsertSpeciality = async (connection, item) => {
  const existing = await getSpecialityByTitle(connection, item.title);
  const specialityId = existing?.id || uuidv4();
  const slug = await generateUniqueSlug(connection, SPECIALITY_TABLE, item.title, existing?.id || null);

  if (existing) {
    await connection.query(
      `UPDATE ${SPECIALITY_TABLE}
       SET slug = ?, top_banner_url = ?, top_banner_key = ?, sub_description = ?, category = ?, description = ?, brochure_url = ?, brochure_key = ?, brochure_type = ?, services_intro = ?, services_heading = ?
       WHERE id = ?`,
      [
        slug,
        item.top_banner_url,
        item.top_banner_key,
        item.sub_description,
        item.category,
        item.description,
        item.brochure_url,
        item.brochure_key,
        item.brochure_type,
        item.services_intro || null,
        item.services_heading || null,
        specialityId,
      ],
    );
  } else {
    await connection.query(
      `INSERT INTO ${SPECIALITY_TABLE}
        (id, slug, title, top_banner_url, top_banner_key, sub_description, category, description, brochure_url, brochure_key, brochure_type, services_intro, services_heading, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        specialityId,
        slug,
        item.title,
        item.top_banner_url,
        item.top_banner_key,
        item.sub_description,
        item.category,
        item.description,
        item.brochure_url,
        item.brochure_key,
        item.brochure_type,
        item.services_intro || null,
        item.services_heading || null,
      ],
    );
  }

  await connection.query(`DELETE FROM ${MAIN_BANNER_TABLE} WHERE speciality_id = ?`, [specialityId]);
  for (let index = 0; index < (item.main_banners || []).length; index += 1) {
    const imagePath = item.main_banners[index];
    await connection.query(
      `INSERT INTO ${MAIN_BANNER_TABLE} (id, speciality_id, image_url, image_key, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), specialityId, imagePath, imagePath, index + 1],
    );
  }

  await connection.query(`DELETE FROM ${SERVICES_TABLE} WHERE speciality_id = ?`, [specialityId]);
  for (let index = 0; index < (item.services || []).length; index += 1) {
    await connection.query(
      `INSERT INTO ${SERVICES_TABLE} (id, speciality_id, title, display_order)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), specialityId, item.services[index], index],
    );
  }

  return { id: specialityId, title: item.title };
};

const upsertDoctor = async (connection, doctor, specialitiesByTitle) => {
  const existing = await getDoctorByName(connection, doctor.name);
  const doctorId = existing?.id || uuidv4();
  const slug = await generateUniqueSlug(connection, DOCTOR_TABLE, doctor.name, existing?.id || null);
  const description =
    `<p>${doctor.name} serves as ${doctor.designation} at GCS Hospital.</p>` +
    `<p>${doctor.name} brings ${doctor.experience} years of clinical experience across ${doctor.speciality_titles.join(", ")}.</p>`;
  const placeholderImage = "/images/logo2.png";

  if (existing) {
    await connection.query(
      `UPDATE ${DOCTOR_TABLE}
       SET slug = ?, image_url = ?, image_key = ?, experience = ?, designation = ?, description = ?, display_order = ?, is_hod = ?
       WHERE id = ?`,
      [
        slug,
        placeholderImage,
        placeholderImage,
        doctor.experience,
        doctor.designation,
        description,
        doctor.display_order,
        doctor.is_hod ? 1 : 0,
        doctorId,
      ],
    );
  } else {
    await connection.query(
      `INSERT INTO ${DOCTOR_TABLE}
        (id, slug, name, image_url, image_key, experience, designation, description, display_order, is_hod, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        doctorId,
        slug,
        doctor.name,
        placeholderImage,
        placeholderImage,
        doctor.experience,
        doctor.designation,
        description,
        doctor.display_order,
        doctor.is_hod ? 1 : 0,
      ],
    );
  }

  await connection.query(`DELETE FROM ${DOCTOR_SPECIALITY_TABLE} WHERE doctor_id = ?`, [doctorId]);
  for (const specialityTitle of doctor.speciality_titles) {
    const speciality = specialitiesByTitle.get(specialityTitle);
    if (!speciality) {
      throw new Error(`Cannot map doctor ${doctor.name} to missing speciality ${specialityTitle}`);
    }

    await connection.query(
      `INSERT INTO ${DOCTOR_SPECIALITY_TABLE} (id, doctor_id, speciality_id)
       VALUES (?, ?, ?)`,
      [uuidv4(), doctorId, speciality.id],
    );
  }
};

const seedDoctorDirectoryData = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    console.log("Seeding doctor directory data...\n");

    await ensureTableExists(connection, SPECIALITY_TABLE);
    await ensureTableExists(connection, MAIN_BANNER_TABLE);
    await ensureTableExists(connection, SERVICES_TABLE);
    await ensureTableExists(connection, DOCTOR_TABLE);
    await ensureTableExists(connection, DOCTOR_SPECIALITY_TABLE);

    const specialitiesByTitle = new Map();
    for (const speciality of specialitySeedData) {
      const seeded = await upsertSpeciality(connection, speciality);
      specialitiesByTitle.set(seeded.title, seeded);
    }

    for (const doctor of doctorSeedData) {
      await upsertDoctor(connection, doctor, specialitiesByTitle);
    }

    await connection.commit();
    console.log(`Seeded ${specialitySeedData.length} specialities and ${doctorSeedData.length} doctors.`);
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("Error seeding doctor directory data:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

seedDoctorDirectoryData();
