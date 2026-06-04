/**
 * One-time seed script: migrates hardcoded committee data into the DB.
 * Run with: node scripts/seedCommittees.js
 */

require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

// ── Static data (copied from frontend files) ──────────────────────────────────

const hospitalCommittees = [
  {
    title: "Blood Transfusion Committee",
    members: [
      ["Director", "Chairman"],
      ["Asso. Professor Pathology", "Secretary"],
      ["Medical Superintendent", "Member"],
      ["Asso. Prof. Pathology", "Member"],
      ["Asst. Professor Pathology", "Member"],
      ["Prof. Medicine", "Member"],
      ["Asso. Prof. Obst & Gynecology", "Member"],
      ["Asso. Professor Surgery", "Member"],
      ["Asso. Professor Anesthesia", "Member"],
      ["Manager - Quality", "Member"],
      ["Deputy Medical Superintendent", "Member"],
    ],
  },
  {
    title: "Grievance Redressal Committee",
    members: [
      ["Medical Superintendent", "Member"],
      ["Nursing Superintendent", "Member"],
      ["Sr. Executive - HR", "Secretary"],
      ["HOD", "Member"],
    ],
  },
  {
    title: "Infection Control Committee",
    members: [
      ["Director", "Chairman"],
      ["Medical Superintendent", "Member"],
      ["Prof. & HOD Microbiology", "Secretary"],
      ["Asst. Prof. General Medicine", "Member"],
      ["Asso. Prof. Surgery", "Member"],
      ["Prof. & HOD Anesthesia", "Member"],
      ["Prof. Pathology", "Member"],
      ["Asso. Prof. Pediatric", "Member"],
      ["Prof. & HOD Obst. & Gynecology", "Member"],
      ["Prof. Community Medicine", "Member"],
      ["Manager Facility", "Member"],
      ["Nursing Superintendent", "Member"],
      ["Deputy Nursing Superintendent", "Member"],
      ["Asst. Nursing Superintendent", "Member"],
      ["Asso. Prof. Microbiology", "Secretary"],
      ["Infection Control Nurse", "Member"],
      ["Manager Quality", "Member"],
      ["Deputy Medical Superintendent", "Member"],
      ["Asst. Professor - Emergency Medicine", "Member"],
      ["HOD of Bio-Medical Engineering", "Member"],
      ["Clinical Pharmacist", "Member"],
    ],
  },
  {
    title: "Medical Audit Committee",
    members: [
      ["Director", "Chairman"],
      ["Medical Superintendent", "Member"],
      ["Prof. & HOD Medicine", "Member"],
      ["Prof. Pathology", "Member"],
      ["Intensivist", "Member"],
      ["Prof. & HOD Orthopedic", "Member"],
      ["Prof. & HOD Surgery", "Member"],
      ["Prof. Paediatrics", "Member"],
      ["Prof. & HOD Obst & Gynecology", "Member"],
      ["Prof. & HOD Anesthesia", "Member"],
      ["Sr. Manager Medical Admin", "Secretary"],
      ["Nursing Superintendent", "Member"],
      ["Manager Quality", "Member"],
      ["MRD-Executive", "Member"],
      ["Deputy Medical Superintendent", "Member"],
    ],
  },
  {
    title: "Pharmaco Therapeutic Committee",
    members: [
      ["Director", "Chairman"],
      ["Medical Superintendent", "Member"],
      ["Prof. & HOD Paediatrics", "Secretary"],
      ["Asso. Prof. Anesthesia", "Member"],
      ["Asso. Prof. Obst. & Gynecology", "Member"],
      ["Prof. Surgery", "Member"],
      ["Asso. Prof. Medicine", "Member"],
      ["Prof. & HOD Pharmacology", "Member"],
      ["Manager - Quality", "Member"],
      ["Manager - Pharmacy", "Member"],
      ["Clinical Pharmacist", "Member"],
      ["Deputy Medical Superintendent", "Member"],
    ],
  },
  {
    title: "Quality Improvement Committee",
    members: [
      ["Medical Superintendent", "Member"],
      ["Intensivist", "Member"],
      ["Prof. Pathology", "Member"],
      ["Blood Bank Incharge", "Member"],
      ["Asst. Prof. Radiology", "Member"],
      ["Prof & HOD Biochemistry", "Member"],
      ["Anesthesia", "Member"],
      ["Sr. Manager Medical Admin", "Member"],
      ["Manager Facility", "Member"],
      ["Asst. Manager - HR", "Member"],
      ["Officer Front Office", "Member"],
      ["Manager - IT", "Member"],
      ["Manager Pharmacy", "Member"],
      ["Bio Medical Engineer", "Member"],
      ["Nursing Superintendent", "Member"],
      ["Deputy Nursing Superintendent", "Member"],
      ["Asst. Nursing Superintendent", "Member"],
      ["Sr. Lab. Technician", "Member"],
      ["Radiation safety officer", "Member"],
      ["Infection Control Nurse", "Member"],
      ["Asst. Manager - Quality", "Member"],
      ["Quality Executive", "Member"],
      ["Clinical Pharmacist", "Member"],
      ["Deputy Medical Superintendent", "Member"],
      ["HOD- Microbiology", "Member"],
      ["Prof. Pharmacovigilance", "Member"],
      ["Prof. Microbiology", "Member"],
      ["Asst. Manager - Operation", "Member"],
      ["Sr. Executive - Quality", "Member"],
      ["Manager Quality", "Secretary"],
    ],
  },
  {
    title: "Safety Committee",
    members: [
      ["Medical Superintendent", "Member"],
      ["Sr. Manager Medical Admin", "Member"],
      ["Manager Facility", "Member"],
      ["Nursing Superintendent", "Member"],
      ["Fire and Safety Officer", "Member"],
      ["Asst. Nursing Superintendent", "Member"],
      ["Maintenance Engineer", "Member"],
      ["Electrical Engineer", "Member"],
      ["Biomedical Engineer", "Member"],
      ["Radiation Safety Officer", "Member"],
      ["Infection Control Nurse", "Member"],
      ["Manager Quality", "Member"],
      ["Deputy Medical Superintendent", "Member"],
      ["Asst. Manager - Quality", "Member"],
    ],
  },
];

const medicalCollegeCommittees = [
  {
    title: "Anti-Ragging Squad",
    members: [
      { name: "Dr. Yogendra S. Modi", role: "Chairman, Dean GCS Medical College", contact_no: "9824021444", email: "deangcsmc@gmail.com" },
      { name: "Mr. P. U. Patel", role: "Member, Manager – ADM", contact_no: "9727769506", email: "parsotam.patel@gcsmc.org" },
      { name: "Dr. Vipul Chaudhary", role: "Member, Professor – Pharmacology", contact_no: "9825444336", email: "drvip79@yahoo.co.in" },
      { name: "Dr. Rutvik Parikh", role: "Member, Professor – Paediatrics", contact_no: "9638181468", email: "drutvikparikh87@gmail.com" },
      { name: "Dr. Aalapi Prajapati", role: "Member, Asstt. Professor – Psychiatry", contact_no: "9558901464", email: "aalapi3012@gmail.com" },
      { name: "Dr. Fairy Panchal", role: "Member, Asstt. Professor – Physiology", contact_no: "7046241008", email: "fairypanchal@gmail.com" },
      { name: "Dr. Sagar Thummar", role: "Member, Asstt. Professor – Microbiology", contact_no: "9737612541", email: "sagarthummar54@gmail.com" },
    ],
  },
  {
    title: "Anti-Ragging Committee",
    members: [
      { name: "Dr. Kirti M. Patel", role: "President, Director GCS Medical College", contact_no: "9825386037", email: "kirtimpatel@yahoo.co.in" },
      { name: "Dr. Yogendra S. Modi", role: "Chairman, Dean GCS Medical College", contact_no: "9824021444", email: "deangcsmc@gmail.com" },
      { name: "Dr. Heena Chhanwal", role: "Member, Medical Superintendent", contact_no: "9925497393", email: "drmrshc@gmail.com" },
      { name: "Dr. Ritesh Shah", role: "Member, Professor & Head – Anatomy", contact_no: "9825439615", email: "drriteshk@yahoo.com" },
      { name: "Dr. Kamlesh Jain", role: "Member, Professor & Head – Comm. Medicine", contact_no: "9714722488", email: "medico_22981@yahoo.com" },
      { name: "Mr. V. Pandhare", role: "Member, Warden – Boys Hostel", contact_no: "9601730513", email: "pandharevr@gmail.com" },
      { name: "Dr. Vidhi Thakar", role: "Member, Warden – Girls Hostel", contact_no: "9429534897", email: "vidhi71284@yahoo.co.in" },
      { name: "ACP 'D' Division Zone – III", role: "Member", contact_no: "079-22140793", email: null },
      { name: "Mrs. Parthivi Saha", role: "Member, Media", contact_no: "9687055444", email: null },
      { name: "Dr. Vaibhav Patel", role: "Member, Parents", contact_no: "9825235347", email: null },
      { name: "Shri R.C. Patel", role: "Member, Ex. Corporator", contact_no: "9898653814", email: "rcpatelbio@gmail.com" },
      { name: "Ms. Kshama S. Nagar", role: "Member, Social Worker", contact_no: "9723004254", email: null },
      { name: "Ms. Sonal Prajapati", role: "Member, Nursing Superintendent", contact_no: "9512820244", email: "sonal.prajapati@gcsmc.org" },
      { name: "Rishita Keval Sondager", role: "Member, Third MBBS Student", contact_no: "9106915040", email: "rishitasondager@icloud.com" },
      { name: "Vraj Piyushkumar Patel", role: "Member, Second MBBS Student", contact_no: "9016970092", email: null },
      { name: "Pia Vishal Sharma", role: "Member, First MBBS Student", contact_no: "8669361811", email: null },
    ],
  },
  {
    title: "College Council Committee",
    members: [
      { name: "Dr. Kirti M. Patel", role: "Director, President" },
      { name: "Dr. Yogendra S. Modi", role: "Dean, Chairman" },
      { name: "Dr. Viral R. Dave", role: "Additional Dean, Vice-Chairman" },
      { name: "Dr. Heena Chhanwal", role: "Medical Superintendent, Member" },
      { name: "HOD of Anatomy", role: "Member-Secretary" },
      { name: "HOD of Microbiology", role: "Member" },
      { name: "HOD of Physiology", role: "Member" },
      { name: "HOD of Biochemistry", role: "Member" },
      { name: "HOD of Pharmacology", role: "Member" },
      { name: "HOD of Pathology", role: "Member" },
      { name: "HOD of Forensic Medicine", role: "Member" },
      { name: "HOD of Community Medicine", role: "Member" },
      { name: "HOD of General Medicine", role: "Member" },
      { name: "HOD of Dermatology", role: "Member" },
      { name: "HOD of Respiratory Medicine", role: "Member" },
      { name: "HOD of Psychiatry", role: "Member" },
      { name: "HOD of General Surgery", role: "Member" },
      { name: "HOD of Obst. & Gynec", role: "Member" },
      { name: "HOD of Orthopaedics", role: "Member" },
      { name: "HOD of Paediatric", role: "Member" },
      { name: "HOD of Otorhinolaryngology", role: "Member" },
      { name: "HOD of Ophthalmology", role: "Member" },
      { name: "HOD of Anaesthesiology", role: "Member" },
      { name: "HOD of Radio-Diagnosis", role: "Member" },
      { name: "HOD of Emergency Medicine", role: "Member" },
      { name: "Brijesh Bavarva", role: "1st Year Resident (General Medicine), Member" },
      { name: "Paritosh Parmar", role: "1st Year Resident (Pharmacology), Member" },
      { name: "Kushal Motwani", role: "1st Year Resident (Community Medicine), Member" },
      { name: "Hitarth Parikh", role: "1st Year Resident (Radiology), Member" },
      { name: "Mohamad Ayan Yatoo", role: "2nd Year MBBS, Member" },
      { name: "Kanishka Inani", role: "2nd Year MBBS, Member" },
      { name: "Nemikumar Shah", role: "2nd Year MBBS, Member" },
      { name: "Kartik Devnani", role: "2nd Year MBBS, Member" },
    ],
  },
  {
    title: "Gender Harassment Committee",
    members: [
      { name: "Medical Superintendent", role: "Member" },
      { name: "Asso. Prof. Pediatric", role: "Member" },
      { name: "Asso. Prof. Medicine", role: "Member" },
      { name: "Nursing Superintendent", role: "Member" },
    ],
  },
  {
    title: "Institution Animal Ethical Committee",
    members: [
      { name: "Dr. Vipul Chaudhari", role: "Chairperson" },
      { name: "Dr. Akanksha B. Prajapati", role: "Member Secretary" },
      { name: "Dr. Avinash Khadela", role: "Member - Scientist" },
      { name: "Dr. Vidhi Thaker", role: "Member - Scientist" },
      { name: "Dr. Niraj Shah", role: "Member - Veterinarian" },
      { name: "Dr. Manish A. Rachchh", role: "Nominee - Main" },
      { name: "Dr. Mithun Singh Rajput", role: "Nominee - Link" },
      { name: "Dr. Ruma Baksi", role: "Member - Scientist From Outside Institute" },
      { name: "Dr. Snehal Patel", role: "Nominee (Socially Aware)" },
    ],
  },
  {
    title: "Institutional Ethics Committee",
    members: [
      { name: "Mr. Bankim N. Mehta", role: "Chair Person" },
      { name: "Dr. Urvesh V. Shah", role: "Member Secretary" },
      { name: "Dr. Pankaj M. Shah", role: "Clinician" },
      { name: "Dr. Heena Chhanwal", role: "Clinician" },
      { name: "Mr. R. C. Patel", role: "Lay Person" },
      { name: "Dr. Hemangini A. Vora", role: "Scientific Member" },
      { name: "Dr. Usha H. Shah", role: "Medical Scientist" },
      { name: "Dr. Akanksha B. Prajapati", role: "Medical Scientist" },
      { name: "Mr. Milan N. Patel", role: "Legal Expert" },
      { name: "Mr. Bipinchandra Shah", role: "Lay Person" },
      { name: "Dr. Viral R. Dave", role: "Clinician" },
      { name: "Dr. Haresh U. Doshi", role: "Clinician" },
      { name: "Mr. Kshitish Madanmohan", role: "Social Scientist" },
      { name: "Mr. Deevyesh Radia", role: "Lay Person" },
    ],
  },
  {
    title: "Medical Education Unit",
    members: [
      { name: "Dr. Yogendra Modi", role: "Chairman, Dean GCS Medical College, Hospital & Research Centre" },
      { name: "Dr. Akanksha B. Prajapati", role: "MEU Coordinator, Associate Professor in Pharmacology" },
      { name: "Dr. Ramesh Pradhan", role: "Member, Professor & Head, Department of Biochemistry" },
      { name: "Dr. Ekta Dalal", role: "Member, Professor in Paediatrics" },
      { name: "Dr. Rupal Shah", role: "Member, Professor in Pathology" },
      { name: "Dr. Aalok Shah", role: "Member, Associate Professor in Orthopaedics" },
      { name: "Dr. Madhur Modi", role: "Member, Associate Professor in Pathology" },
      { name: "Dr. Vidhi Thaker", role: "Member, Associate Professor in Pharmacology" },
      { name: "Dr. Asmita Chaudhary", role: "Member, Professor in Anaesthesiology" },
      { name: "Dr. Jigna Padhiyar", role: "Member, Professor in Dermatology" },
      { name: "Dr. Kanupriya Singh", role: "Member, Professor in Obst. & Gynec" },
      { name: "Dr. Anand Mistry", role: "Member, Professor in Physiology" },
    ],
  },
  {
    title: "Curriculum Committee",
    members: [
      { name: "Dr. Yogendra Modi", role: "Chairman, Dean GCS Medical College, Hospital & Research Centre" },
      { name: "Dr. Akanksha B. Prajapati", role: "MEU Coordinator, Associate Professor in Pharmacology" },
      { name: "Dr. Shital Shah", role: "Member, Professor, Department of Anatomy" },
      { name: "Dr. Urvesh Shah", role: "Member, Professor, Department of Microbiology" },
      { name: "Dr. Prarthana Kharod Patel", role: "Member, Professor, Department of Paediatrics" },
      { name: "Dr. Rushi Patel", role: "Member, Professor, Department of Respiratory Medicine" },
      { name: "Dr. Suktara Sharma", role: "Member, Professor, Department of Otorahinolaryngology" },
      { name: "Dr. Divya Kheskani", role: "Member, Professor, Department of Anaesthesiology" },
      { name: "Suhani Prajapati", role: "Student Representative" },
      { name: "Nishi Thakar", role: "Student Representative" },
      { name: "Moksh", role: "Student Representative" },
    ],
  },
  {
    title: "Pharmacovigilance Committee",
    members: [
      { name: "Dr. Vipul Chaudhari", role: "Chairman, Professor & Head, Department of Pharmacology" },
      { name: "Dr. Nayan Patel", role: "Member Secretary, Professor & Head, Department of Dermatology" },
      { name: "Dr. Heena Chhanwal", role: "Member, Medical Superintendent" },
      { name: "Dr. Shashank Desai", role: "Member, Professor & Head, Department of General Surgery" },
      { name: "Dr. Shaila Shah", role: "Member, Professor & Head, Department of General Medicine" },
      { name: "Dr. Nikunj Desai", role: "Member, Professor, Department of Radio Diagnosis" },
      { name: "Dr. Rushi Patel", role: "Member, Professor, Department of Respiratory Medicine" },
      { name: "Ms. Sonal Prajapati", role: "Member, Nursing Superintendent" },
    ],
  },
  {
    title: "Scientific Research Committee",
    members: [
      { name: "Dr. Kirti M. Patel", role: "Chairman" },
      { name: "Dr. Urvesh Shah", role: "Member Secretary" },
      { name: "Dr. Vilas J. Patel", role: "Member" },
      { name: "Dr. Viral R. Dave", role: "Member" },
      { name: "Dr. Shaila Shah", role: "Member" },
      { name: "Dr. Nayan Patel", role: "Member" },
      { name: "Dr. Akanksha Prajapati", role: "Member" },
      { name: "Dr. Divya Kheskani", role: "Member" },
    ],
  },
];

const nursingCommittees = [
  {
    title: "Admission Committee",
    members: [
      { name: "Jayesh Jain", role: "Chairman" },
      { name: "Ms. Stuti", role: "Member" },
      { name: "Ms. Payal", role: "Member" },
      { name: "Mr. Abhinav", role: "Member" },
      { name: "Ms. Poorvi", role: "Member" },
    ],
  },
  {
    title: "Anti-Ragging Committee",
    members: [
      { name: "Jayesh Jain", role: "Chairman" },
      { name: "Ms. Nidhi", role: "Member" },
      { name: "Ms. Mittal", role: "Member" },
      { name: "Mr. Bhupendra", role: "Member" },
      { name: "Ms. Khushbu", role: "Member" },
    ],
  },
  {
    title: "Curriculum Committee",
    members: [
      { name: "Jayesh Jain", role: "Chairman" },
      { name: "Mr. Abhinav", role: "Member" },
      { name: "Ms. Nisha", role: "Member" },
      { name: "Ms. Vaishali", role: "Member" },
      { name: "Ms. Khushbu", role: "Member" },
      { name: "Mr. Bhupendra", role: "Member" },
      { name: "Ms. Jalaj", role: "Member" },
      { name: "Ms. Nidhi", role: "Member" },
    ],
  },
  {
    title: "Disciplinary Committee",
    members: [
      { name: "Jayesh Jain", role: "Chairman" },
      { name: "Ms. Nidhi Patel", role: "Member" },
      { name: "Ms. Nisha", role: "Member" },
      { name: "Mr. Bhupendra", role: "Member" },
      { name: "Ms. Khushbu", role: "Member" },
      { name: "Ms. Nidhi", role: "Member" },
    ],
  },
  {
    title: "Health and Welfare Committee",
    members: [
      { name: "Jayesh Jain", role: "Chairman" },
      { name: "Ms. Palak", role: "Member" },
      { name: "Ms. Sonal", role: "Member" },
      { name: "Ms. Mittal", role: "Member" },
      { name: "Mr. Abhinav", role: "Member" },
      { name: "Ms. Priyanka", role: "Member" },
      { name: "Ms. Jalaj", role: "Member" },
    ],
  },
  {
    title: "SNA Committee",
    members: [
      { name: "Jayesh Jain", role: "Chairman" },
      { name: "Ms. Ripple", role: "Member" },
      { name: "Ms. Sama", role: "Member" },
      { name: "Ms. Zeel", role: "Member" },
      { name: "Ms. Pallavi", role: "Member" },
    ],
  },
  {
    title: "Sport Committee",
    members: [
      { name: "Jayesh Jain", role: "Chairman" },
      { name: "Ms. Nisha", role: "Member" },
      { name: "Ms. Nidhi", role: "Member" },
      { name: "Ms. Payal", role: "Member" },
      { name: "Mr. Bhupendra", role: "Member" },
      { name: "Ms. Stephy", role: "Member" },
      { name: "Ms. Pallavi", role: "Member" },
    ],
  },
  {
    title: "Student Counseling Committee",
    members: [
      { name: "Jayesh Jain", role: "Chairman" },
      { name: "Ms. Zeel", role: "Member" },
      { name: "Ms. Stuti", role: "Member" },
      { name: "Mr. Abhinav", role: "Member" },
      { name: "Ms. Nisha", role: "Member" },
      { name: "Ms. Dipti", role: "Member" },
    ],
  },
  {
    title: "Women Empowerment Cell",
    members: [
      { name: "Jayesh Jain", role: "Chairman" },
      { name: "Ms. Nisha", role: "Member" },
      { name: "Ms. Nidhi", role: "Member" },
      { name: "Ms. Stuti", role: "Member" },
      { name: "Ms. Parul", role: "Member" },
      { name: "Ms. Vaishali", role: "Member" },
      { name: "Ms. Palak", role: "Member" },
    ],
  },
];

const researchCommittees = [
  {
    title: "Scientific Research Committee",
    members: [
      ["Dr. Kirti M. Patel", "Ex-officio"],
      ["Dr. Jagdish Khoyani", "Ex-officio"],
      ["Dr. Yogendra Modi", "Ex-officio"],
      ["Dr. Heena Chhanwal", "Ex-officio"],
      ["Dr. Viral R. Dave", "Ex-officio"],
      ["Dr. Urvesh Shah", "Member-Secretary"],
      ["Dr. Venu R. Shah", "Member"],
      ["Dr. Vipul Chaudhary", "Member"],
      ["Dr. Aakansha Prajapati", "Member"],
      ["Dr. Divya Kheskani", "Member"],
      ["Dr. Shaila Shah", "Member"],
      ["Dr. Nayan Patel", "Member"],
      ["Dr. Shashank Desai", "Member"],
      ["Dr. Suktara Sharma", "Member"],
      ["Dr. Shikha Jain", "Member"],
      ["Dr. Ekta Dalal", "Member"],
    ],
  },
  {
    title: "Institution Ethical Committee",
    description: "Oversees ethical review of clinical trials, BA/BE studies, and biomedical & health research.",
    members: [],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const generateUniqueSlug = async (name, usedSlugs) => {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${counter++}`;
  }
  usedSlugs.add(slug);
  return slug;
};

// ── Seed ──────────────────────────────────────────────────────────────────────

const seed = async () => {
  const usedSlugs = new Set();

  const toSeed = [
    ...hospitalCommittees.map((c) => ({ ...c, department: "hospital" })),
    ...researchCommittees.map((c) => ({ ...c, department: "research" })),
    ...medicalCollegeCommittees.map((c) => ({ ...c, department: "medical_college" })),
    ...nursingCommittees.map((c) => ({ ...c, department: "nursing" })),
  ];

  for (let i = 0; i < toSeed.length; i++) {
    const { title, department, description, members } = toSeed[i];
    const id = uuidv4();
    const slug = await generateUniqueSlug(title, usedSlugs);

    const [existing] = await pool.query(
      "SELECT id FROM gcs_committees WHERE slug = ? OR (name = ? AND department = ?)",
      [slug, title, department],
    );
    if (existing.length > 0) {
      console.log(`Skipped (already exists): ${title} [${department}]`);
      continue;
    }

    await pool.query(
      `INSERT INTO gcs_committees (id, slug, name, department, description, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, slug, title, department, description || null, i],
    );

    for (let j = 0; j < members.length; j++) {
      const m = members[j];
      // Support both legacy [name, role] tuple format (hospital) and object format (medical_college, nursing)
      const memberName = Array.isArray(m) ? m[0] : m.name;
      const memberRole = Array.isArray(m) ? m[1] : m.role;
      const contactNo = Array.isArray(m) ? null : (m.contact_no || null);
      const email = Array.isArray(m) ? null : (m.email || null);

      await pool.query(
        `INSERT INTO gcs_committee_members (id, committee_id, member_name, member_role, sort_order, contact_no, email)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), id, memberName, memberRole, j, contactNo, email],
      );
    }

    console.log(`Seeded: ${title} [${department}] (${members.length} members)`);
  }

  console.log("\nSeeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
