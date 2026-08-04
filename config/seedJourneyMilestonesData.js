const { v4: uuidv4 } = require("uuid");
const pool = require("./db");

const milestones = [
  { year: "1961", icon_key: "star", color_key: "orange", side: "left", events: [
    { title: "Foundation", description: "Formation of The Gujarat Cancer Society, 02 Apr 1961" },
  ] },
  { year: "1962", icon_key: "building", color_key: "emerald", side: "right", events: [
    { title: "Construction", description: "Cancer Hospital Building construction, 27 Mar 1962" },
  ] },
  { year: "1965", icon_key: "microscope", color_key: "blue", side: "left", events: [
    { title: "Radiation Prep", description: "Radiation Oncology started with an Isotope Unit." },
  ] },
  { year: "1966", icon_key: "building", color_key: "purple", side: "right", events: [
    { title: "Inauguration", description: "The M P Shah Cancer Hospital inaugurated by Smt Indira Gandhi." },
  ] },
  { year: "1972", icon_key: "award", color_key: "cyan", side: "left", events: [
    { title: "Autonomy", description: "Tripartite agreement and Autonomous status to Hospital." },
  ] },
  { year: "1973", icon_key: "heart", color_key: "rose", side: "right", events: [
    { title: "Modern ICU", description: "Modern Intensive Care Unit and Pain Clinic started." },
  ] },
  { year: "1979", icon_key: "microscope", color_key: "indigo", side: "left", events: [
    { title: "Research Center", description: "Shri Kasturbhai Lalbhai Research Centre established." },
  ] },
  { year: "1984", icon_key: "microscope", color_key: "amber", side: "right", events: [
    { title: "CT Scan", description: "Inauguration of Shri Navnitlal Ranchhodlal CT Scan Centre." },
  ] },
  { year: "1988", icon_key: "award", color_key: "violet", side: "left", events: [
    { title: "Govt Visit", description: "Community Oncology Centre inaugurated by H E President of India." },
  ] },
  { year: "1990", icon_key: "microscope", color_key: "sky", side: "right", events: [
    { title: "Advancement", description: "Radiation Oncology received first Linear Accelerator II." },
  ] },
  { year: "1992", icon_key: "star", color_key: "pink", side: "left", events: [
    { title: "Paediatric Center", description: "First in India Paediatric Oncology Centre inaugurated." },
  ] },
  { year: "1993", icon_key: "heart", color_key: "red", side: "right", events: [
    { title: "Intervention", description: "Interventional Therapy Unit opened on 22 Dec 1993." },
  ] },
  { year: "1994", icon_key: "microscope", color_key: "teal", side: "left", events: [
    { title: "Radiotherapy", description: "Opening of Radiotherapy Centre in Jan 1994." },
  ] },
  { year: "1997", icon_key: "building", color_key: "lime", side: "right", events: [
    { title: "New OPD", description: "New OPD Building inaugurated on 20 Jun 1997." },
  ] },
  { year: "2002", icon_key: "heart", color_key: "red", side: "left", events: [
    { title: "Bone Marrow", description: "Bone-Marrow Transplantation Unit started." },
  ] },
  { year: "2009", icon_key: "building", color_key: "blue", side: "right", events: [
    { title: "GCSMC Land", description: "Govt handed over land for GCS Medical College." },
  ] },
  { year: "2011", icon_key: "building", color_key: "emerald", side: "left", events: [
    { title: "Inauguration of GCS Medical College & Hospital", description: "In collaboration with the Government of Gujarat, GCS Medical College, Hospital & Research Centre was inaugurated." },
  ] },
  { year: "2012", icon_key: "graduation-cap", color_key: "blue", side: "right", events: [
    { title: "1st Batch of MBBS", description: "Commencement of the first MBBS batch, marking the beginning of academic excellence." },
  ] },
  { year: "2013", icon_key: "brain-circuit", color_key: "violet", side: "left", events: [
    { title: "CT Scan & 5D Sonography", description: "Introduction of advanced diagnostic imaging and super-specialty services." },
  ] },
  { year: "2014", icon_key: "activity", color_key: "cyan", side: "right", events: [
    { title: "Dialysis Unit & Pharmacy", description: "Launch of dedicated dialysis services, special rooms, and a fully equipped pharmacy." },
  ] },
  { year: "2015", icon_key: "stethoscope", color_key: "teal", side: "left", events: [
    { title: "10th Floor ICU", description: "State-of-the-art ICU facility with advanced critical care setup." },
    { title: "1st Batch of Nursing", description: "Start of Nursing education with the inaugural batch of students." },
  ] },
  { year: "2016", icon_key: "microscope", color_key: "purple", side: "right", events: [
    { title: "First MRI Machine", description: "Installation of advanced MRI technology." },
    { title: "Blood Donation Van & ICU-on-Wheels", description: "Mobile units launched to expand access to emergency care and blood donation." },
  ] },
  { year: "2017", icon_key: "graduation-cap", color_key: "blue", side: "left", events: [
    { title: "1st Batch of PG Course", description: "Postgraduate Degree programs started with an intake of 28 students." },
    { title: "Graduation of Pioneer MBBS Batch", description: "The first batch of MBBS students graduated." },
  ] },
  { year: "2018", icon_key: "ambulance", color_key: "orange", side: "right", events: [
    { title: "Emergency & HMIS", description: "50-bedded emergency department started and Hospital Management Information System (HMIS) implemented." },
  ] },
  { year: "2019", icon_key: "heart", color_key: "red", side: "left", events: [
    { title: "DNB Courses", description: "Diplomate National Board (DNB) programs initiated." },
    { title: "Cath Lab - Cardiac Unit", description: "State-of-the-art Cath Lab and fully equipped cardiac care unit started." },
  ] },
  { year: "2020", icon_key: "users", color_key: "amber", side: "right", events: [
    { title: "1 Million Patients Milestone", description: "Achieved a landmark of serving over 1 million patients." },
  ] },
  { year: "2021", icon_key: "activity", color_key: "rose", side: "left", events: [
    { title: "1st Batch of Healthcare Academy", description: "Introduction of skill development and training programs." },
    { title: "COVID Care", description: "Successfully treated over 6000 COVID patients." },
  ] },
  { year: "2022", icon_key: "shield-check", color_key: "sky", side: "right", events: [
    { title: "NABH Accreditation", description: "Recognition for quality and excellence in healthcare services." },
  ] },
  { year: "2023", icon_key: "award", color_key: "emerald", side: "left", events: [
    { title: "Mammography & Advanced Equipment", description: "Installation of multi-use diagnostic equipment for breast, liver, thyroid, etc." },
    { title: "IVF & Kidney Transplant Unit", description: "Specialized services in reproductive medicine and renal transplant introduced." },
    { title: "Ayushman Bharat Gold Award Certification", description: "National-level recognition for healthcare excellence." },
  ] },
  { year: "2024", icon_key: "microscope", color_key: "indigo", side: "right", events: [
    { title: "Child Development Centre", description: "Comprehensive child health and developmental support services started." },
    { title: "GCS Centre Research Unit", description: "Dedicated medical research centre inaugurated." },
    { title: "1st Batch of Physiotherapy College", description: "Launch of the Physiotherapy College under Gujarat University." },
    { title: "Advanced CT-Scan", description: "Installation of high-end CT imaging technology." },
  ] },
  { year: "2025", icon_key: "building", color_key: "blue", side: "left", events: [
    { title: "Next-Generation Healthcare Expansion", description: "Commitment towards advanced facilities, innovation, and patient-centric excellence." },
  ] },
];

const seedJourneyMilestones = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.query("SELECT id FROM gcs_users ORDER BY created_at ASC LIMIT 1");
    const createdBy = users[0]?.id || null;

    for (let index = 0; index < milestones.length; index += 1) {
      const item = milestones[index];
      const displayOrder = milestones.length - index;
      const [existing] = await connection.query(
        "SELECT id FROM gcs_journey_milestones WHERE year = ? ORDER BY created_at ASC LIMIT 1",
        [item.year],
      );
      const milestoneId = existing[0]?.id || uuidv4();

      if (existing.length) {
        await connection.query(
          `UPDATE gcs_journey_milestones
           SET icon_key = ?, color_key = ?, side = ?, display_order = ?, status = 'active'
           WHERE id = ?`,
          [item.icon_key, item.color_key, item.side, displayOrder, milestoneId],
        );
      } else {
        await connection.query(
          `INSERT INTO gcs_journey_milestones
            (id, year, icon_key, color_key, side, display_order, status, created_by)
           VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
          [milestoneId, item.year, item.icon_key, item.color_key, item.side, displayOrder, createdBy],
        );
      }

      await connection.query(
        "DELETE FROM gcs_journey_milestone_events WHERE milestone_id = ?",
        [milestoneId],
      );
      for (let eventIndex = 0; eventIndex < item.events.length; eventIndex += 1) {
        const event = item.events[eventIndex];
        await connection.query(
          `INSERT INTO gcs_journey_milestone_events
            (id, milestone_id, title, description, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), milestoneId, event.title, event.description, eventIndex + 1],
        );
      }
    }

    await connection.commit();
    console.log(`Seeded ${milestones.length} journey milestones successfully`);
  } catch (error) {
    await connection.rollback();
    console.error("Failed to seed journey milestones:", error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
};

seedJourneyMilestones();
