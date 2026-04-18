const socialProfileDao = require("../dao/socialProfileDao");
const { ok, error } = require("../utils/responseHandler");

const getSocialProfiles = async (req, res) => {
  try {
    const profiles = await socialProfileDao.getSocialProfiles();
    return ok(res, "Social profiles fetched successfully", profiles);
  } catch (err) {
    console.error("Get social profiles error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateSocialProfiles = async (req, res) => {
  try {
    const { facebook, twitter, linkedin, youtube, instagram } = req.body;

    const profiles = await socialProfileDao.upsertSocialProfiles({
      facebook,
      twitter,
      linkedin,
      youtube,
      instagram,
    });

    return ok(res, "Social profiles updated successfully", profiles);
  } catch (err) {
    console.error("Update social profiles error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  getSocialProfiles,
  updateSocialProfiles,
};
