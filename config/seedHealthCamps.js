const pool = require("./db");
const { v4: uuidv4 } = require("uuid");

const CAMPS_DATA = [
  { year: 2011, camps: 5,   no_of_patients: 1968  },
  { year: 2012, camps: 23,  no_of_patients: 7135  },
  { year: 2013, camps: 20,  no_of_patients: 4133  },
  { year: 2014, camps: 102, no_of_patients: 17285 },
  { year: 2015, camps: 64,  no_of_patients: 11767 },
  { year: 2016, camps: 75,  no_of_patients: 23239 },
  { year: 2017, camps: 76,  no_of_patients: 19745 },
  { year: 2018, camps: 52,  no_of_patients: 9038  },
  { year: 2019, camps: 60,  no_of_patients: 12133 },
  { year: 2020, camps: 5,   no_of_patients: 1452  },
  { year: 2021, camps: 49,  no_of_patients: 6374  },
  { year: 2022, camps: 35,  no_of_patients: 4163  },
];

const seedHealthCamps = async () => {
  try {
    const [existing] = await pool.query("SELECT COUNT(*) AS cnt FROM gcs_health_camps");
    if (existing[0].cnt > 0) {
      console.log(`Table already has ${existing[0].cnt} row(s) — aborting to avoid duplicates.`);
      process.exit(0);
    }

    for (const row of CAMPS_DATA) {
      await pool.query(
        "INSERT INTO gcs_health_camps (id, year, camps, no_of_patients) VALUES (?, ?, ?, ?)",
        [uuidv4(), row.year, row.camps, row.no_of_patients]
      );
      console.log(`Inserted: ${row.year} — ${row.camps} camps, ${row.no_of_patients} patients`);
    }

    console.log("\nAll 12 rows inserted successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedHealthCamps();
