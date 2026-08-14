const pool = require("./db");

const studentTestimonials = [
  {
    id: "2fbd6b92-810c-4dbb-920e-fb2f44710f41",
    title: "Neel Pradip Joshi",
    position: "GCS Medical College Alumnus",
    imageUrl:
      "https://www.gcsmc.org/assets/images/student-testimonial/dr-neel-pradip-joshi.jpg",
    imageKey: "legacy/student-testimonial/dr-neel-pradip-joshi.jpg",
    description:
      "GCS Medical College has been a home to holistic development and top-notch education for us. The timely evaluation of clinical skills, and the ethics-based training, that has nurtured us into becoming a good human alongside being a good doctor. The unmatched infrastructure of the medical college and the faculties who have taught us with utter dedication, have transformed us and made us competent to build a better tomorrow. GCSMCH has shaped us with the best-in-class training throughout these years, which has always been reflected in our academic achievements. I will forever be grateful for the same.",
    createdAt: "2026-08-14 00:00:04",
  },
  {
    id: "ea8b9f1f-95fb-47cc-b46b-9d09d019c5d6",
    title: "Dr. Suraj Chandwani",
    position: "GCS Medical College Alumnus",
    imageUrl:
      "https://www.gcsmc.org/assets/images/student-testimonial/dr-suraj-chandwani.jpg",
    imageKey: "legacy/student-testimonial/dr-suraj-chandwani.jpg",
    description:
      "I remember being the first admission to GCSMC back in 2011, a college comprising of a passionate group of highly accredited medical professionals, who not only taught me medicine, but also the right way to practice it. And today, more than a decade down the line, I cannot be more thankful that I was a part of GCSMC. The foundation that was laid in the college helped me flourish with confidence and be proud of my basics, even in the European medical setup. Thank you to all the professors at GCSMC! I shall always be very grateful.",
    createdAt: "2026-08-14 00:00:03",
  },
  {
    id: "072a4255-e027-4843-8782-52ee496d14de",
    title: "Dr. Urva Dholu",
    position: "GCS Medical College Alumna",
    imageUrl:
      "https://www.gcsmc.org/assets/images/student-testimonial/dr-urva-dholu.jpg",
    imageKey: "legacy/student-testimonial/dr-urva-dholu.jpg",
    description:
      "Taking a moment to share the result of months of organization, constant hard work, endless discussions hoping to meet on a common ground. From brainstorming treasure hunt locations to a nightery disco, from preparing for sports and steps to performing. We all have come a long way and have made some wonderful memories which we would daydream about during some busy OPD afternoons. I would like to thank the whole GCS family for being so supportive and helping each of us grow.",
    createdAt: "2026-08-14 00:00:02",
  },
  {
    id: "f5d434ba-e39c-4180-bbe8-3004c95b8fc9",
    title: "Dr. Ayushi Patel",
    position: "2nd year resident, Department of Microbiology",
    imageUrl:
      "https://www.gcsmc.org/assets/images/student-testimonial/dr-ayushi-patel.jpg",
    imageKey: "legacy/student-testimonial/dr-ayushi-patel.jpg",
    description:
      "Getting admission to GCS for my MBBS studies turned out to be a very much appropriate decision for me which contributed a lot to molding a student in me into the kind of doctor I am today. It gave me the privilege to learn from one of the best kinds of faculties which is the perfect amalgamation of young enthusiastic wise experienced doctors turned teachers. This led me to choose GCS once again for my post-graduation study in MD Microbiology where I get extensive exposure to quality work in microbiology under the guidance of highly accredited faculties aceing in the field of microbiology.",
    createdAt: "2026-08-14 00:00:01",
  },
];

async function seedStudentTestimonials() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gcs_student_testimonials (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_key VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        created_by VARCHAR(36) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES gcs_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    let inserted = 0;
    let skipped = 0;

    for (const testimonial of studentTestimonials) {
      const [existing] = await pool.query(
        "SELECT id FROM gcs_student_testimonials WHERE title = ? LIMIT 1",
        [testimonial.title],
      );

      if (existing.length > 0) {
        skipped += 1;
        continue;
      }

      await pool.query(
        `INSERT INTO gcs_student_testimonials
          (id, title, position, image_url, image_key, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          testimonial.id,
          testimonial.title,
          testimonial.position,
          testimonial.imageUrl,
          testimonial.imageKey,
          testimonial.description,
          testimonial.createdAt,
        ],
      );
      inserted += 1;
    }

    console.log(
      `Student testimonial seed complete: ${inserted} inserted, ${skipped} already present.`,
    );
    process.exit(0);
  } catch (error) {
    console.error("Unable to seed student testimonials:", error.message);
    process.exit(1);
  }
}

seedStudentTestimonials();
