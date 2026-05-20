const pool = require("./db");
const governmentSchemeDao = require("../dao/governmentSchemeDao");

const seedGovernmentSchemesData = async () => {
  try {
    console.log("Seeding government schemes data...\n");

    const [existingRows] = await pool.query(
      "SELECT id FROM gcs_government_schemes WHERE scheme_name = ? LIMIT 1",
      ["Ayushman Bharat Yojana (PM-JAY)"],
    );

    const data = {
      scheme_name: 'Ayushman Bharat Yojana (PM-JAY)',
      badge_text: 'PMJAY-MA',
      description:
        'PM-JAY provides cashless cover of up to Rs. 5,00,000 per annum to each eligible family for listed secondary and tertiary care conditions. Ayushman Bharat (PM-JAY) aims to reduce the financial burden on poor and vulnerable groups arising out of catastrophic hospital episodes and ensure their access to quality health services. Ayushman Bharat (PM-JAY) is the world’s largest health-care scheme, and it seeks to accelerate India’s progress towards achievement of Universal Health Coverage (UHC).',
      cash_less_cover: 'Up to Rs. 5,00,000 per annum per eligible family',
      required_documents: ['Ration Card', 'Aadhar Card', 'Income Certificate'],
      opd_visits: 68916,
      ipd_admissions: 11592,
      dialysis_count: 4524,
      chemo_count: 2028,
      free_opd_specialities: [
        'Interventional Cardiology',
        'Cardiothoracic & Vascular Surgery',
        'Neurology',
        'Spine Surgery',
        'Neurosurgery',
        'Urology',
        'Surgical Oncology',
        'Medical Oncology',
        'Nephrology & Kidney Transplant',
      ],
      empanelled_specialities: [
        'Cardiology',
        'Cardio Thoracic Surgery',
        'Nephrology',
        'Urology',
        'Neurosurgery',
        'Spine Surgery',
        'Orthopedics',
        'Medical Oncology',
        'Surgical Oncology',
        'ICU care',
        'ENT',
        'Obstetrics & Gynecology',
        'General Surgery',
        'Oral Surgery',
        'Pediatric care',
        'Emergency/Trauma Surgery',
        'Respiratory diseases',
      ],
      display_order: 1,
    };

    if (existingRows.length > 0) {
      await governmentSchemeDao.updateScheme(existingRows[0].id, data);
      console.log("PM-JAY government scheme seed updated");
    } else {
      await governmentSchemeDao.createScheme(data);
      console.log("PM-JAY government scheme seed created");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding government schemes data:", error.message);
    console.error(error);
    process.exit(1);
  }
};

seedGovernmentSchemesData();
