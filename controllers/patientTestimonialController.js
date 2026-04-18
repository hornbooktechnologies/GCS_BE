const patientTestimonialDao = require("../dao/patientTestimonialDao");
const { ok, created, error } = require("../utils/responseHandler");

const validatePayload = ({ name, video_url }) => {
  if (!name || !video_url) {
    return "Name and video URL are required";
  }
  return null;
};

const createPatientTestimonial = async (req, res) => {
  try {
    const { name, video_url, status } = req.body;
    const validationError = validatePayload({ name, video_url });
    if (validationError) {
      return error(res, 400, validationError, { code: "MISSING_FIELDS" });
    }

    const testimonial = await patientTestimonialDao.createPatientTestimonial({
      name,
      video_url,
      status: status || "active",
      created_by: req.user ? req.user.id : null,
    });

    return created(
      res,
      "Patient testimonial created successfully",
      testimonial,
    );
  } catch (err) {
    console.error("Create patient testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAllPatientTestimonials = async (req, res) => {
  try {
    const includeInactive = req.query.all === "true";
    const testimonials =
      await patientTestimonialDao.getAllPatientTestimonials(includeInactive);
    return ok(res, "Patient testimonials fetched successfully", {
      testimonials,
    });
  } catch (err) {
    console.error("Get patient testimonials error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getPatientTestimonialById = async (req, res) => {
  try {
    const testimonial = await patientTestimonialDao.getPatientTestimonialById(
      req.params.id,
    );
    if (!testimonial) {
      return error(res, 404, "Patient testimonial not found");
    }
    return ok(res, "Patient testimonial fetched successfully", testimonial);
  } catch (err) {
    console.error("Get patient testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updatePatientTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await patientTestimonialDao.getPatientTestimonialById(id);
    if (!existing) {
      return error(res, 404, "Patient testimonial not found");
    }

    const { name, video_url, status } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (video_url !== undefined) updateData.video_url = video_url;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    await patientTestimonialDao.updatePatientTestimonial(id, updateData);
    return ok(res, "Patient testimonial updated successfully");
  } catch (err) {
    console.error("Update patient testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deletePatientTestimonial = async (req, res) => {
  try {
    const deleted = await patientTestimonialDao.deletePatientTestimonial(
      req.params.id,
    );
    if (!deleted) {
      return error(res, 404, "Patient testimonial not found");
    }
    return ok(res, "Patient testimonial deleted successfully");
  } catch (err) {
    console.error("Delete patient testimonial error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const reorderPatientTestimonials = async (req, res) => {
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

    await patientTestimonialDao.updatePatientTestimonialOrder(orderedItems);
    return ok(res, "Patient testimonial order updated successfully");
  } catch (err) {
    console.error("Reorder patient testimonials error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  createPatientTestimonial,
  getAllPatientTestimonials,
  getPatientTestimonialById,
  updatePatientTestimonial,
  deletePatientTestimonial,
  reorderPatientTestimonials,
};
