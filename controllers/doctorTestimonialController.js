const doctorTestimonialDao = require("../dao/doctorTestimonialDao");
const { ok, created, error } = require("../utils/responseHandler");

const validatePayload = ({ name, video_url }) => {
  if (!name || !video_url) {
    return "Name and video URL are required";
  }
  return null;
};

const createDoctorTestimonial = async (req, res) => {
  try {
    const { name, video_url, status } = req.body;
    const validationError = validatePayload({ name, video_url });
    if (validationError) {
      return error(res, 400, validationError, { code: "MISSING_FIELDS" });
    }

    const testimonial = await doctorTestimonialDao.createDoctorTestimonial({
      name,
      video_url,
      status: status || "active",
      created_by: req.user ? req.user.id : null,
    });

    return created(res, "Doctor testimonial created successfully", testimonial);
  } catch (err) {
    console.error("Create doctor testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllDoctorTestimonials = async (req, res) => {
  try {
    const includeInactive = req.query.all === "true";
    const testimonials =
      await doctorTestimonialDao.getAllDoctorTestimonials(includeInactive);
    return ok(res, "Doctor testimonials fetched successfully", {
      testimonials,
    });
  } catch (err) {
    console.error("Get doctor testimonials error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getDoctorTestimonialById = async (req, res) => {
  try {
    const testimonial = await doctorTestimonialDao.getDoctorTestimonialById(
      req.params.id,
    );
    if (!testimonial) {
      return error(res, 404, "Doctor testimonial not found");
    }
    return ok(res, "Doctor testimonial fetched successfully", testimonial);
  } catch (err) {
    console.error("Get doctor testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateDoctorTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await doctorTestimonialDao.getDoctorTestimonialById(id);
    if (!existing) {
      return error(res, 404, "Doctor testimonial not found");
    }

    const { name, video_url, status } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (video_url !== undefined) updateData.video_url = video_url;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await doctorTestimonialDao.updateDoctorTestimonial(id, updateData);
    return ok(res, "Doctor testimonial updated successfully");
  } catch (err) {
    console.error("Update doctor testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteDoctorTestimonial = async (req, res) => {
  try {
    const deleted = await doctorTestimonialDao.deleteDoctorTestimonial(
      req.params.id,
    );
    if (!deleted) {
      return error(res, 404, "Doctor testimonial not found");
    }
    return ok(res, "Doctor testimonial deleted successfully");
  } catch (err) {
    console.error("Delete doctor testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const reorderDoctorTestimonials = async (req, res) => {
  try {
    const { orderedItems } = req.body;
    if (!Array.isArray(orderedItems) || orderedItems.length === 0) {
      return error(res, 400, "orderedItems array is required", {
        code: "MISSING_FIELDS",
      });
    }

    for (const item of orderedItems) {
      if (!item.id || item.display_order === undefined) {
        return error(res, 400, "Each item must have 'id' and 'display_order'", {
          code: "INVALID_DATA",
        });
      }
    }

    await doctorTestimonialDao.updateDoctorTestimonialOrder(orderedItems);
    return ok(res, "Doctor testimonial order updated successfully");
  } catch (err) {
    console.error("Reorder doctor testimonials error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createDoctorTestimonial,
  getAllDoctorTestimonials,
  getDoctorTestimonialById,
  updateDoctorTestimonial,
  deleteDoctorTestimonial,
  reorderDoctorTestimonials,
};
