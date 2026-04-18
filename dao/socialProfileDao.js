const pool = require("../config/db");

const SETTINGS_ID = 1;

const getSocialProfiles = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM gcs_social_profiles WHERE id = ?",
    [SETTINGS_ID],
  );
  return (
    rows[0] || {
      id: SETTINGS_ID,
      facebook: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      instagram: "",
    }
  );
};

const upsertSocialProfiles = async (data) => {
  await pool.query(
    `INSERT INTO gcs_social_profiles (id, facebook, twitter, linkedin, youtube, instagram)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       facebook = VALUES(facebook),
       twitter = VALUES(twitter),
       linkedin = VALUES(linkedin),
       youtube = VALUES(youtube),
       instagram = VALUES(instagram)`,
    [
      SETTINGS_ID,
      data.facebook || null,
      data.twitter || null,
      data.linkedin || null,
      data.youtube || null,
      data.instagram || null,
    ],
  );

  return getSocialProfiles();
};

module.exports = {
  getSocialProfiles,
  upsertSocialProfiles,
};
