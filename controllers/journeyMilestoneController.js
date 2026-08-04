const journeyMilestoneDao = require("../dao/journeyMilestoneDao");
const { ok, created, error } = require("../utils/responseHandler");

const ICON_KEYS = new Set([
  "star",
  "building",
  "microscope",
  "award",
  "heart",
  "graduation-cap",
  "brain-circuit",
  "activity",
  "stethoscope",
  "ambulance",
  "users",
  "shield-check",
]);

const COLOR_KEYS = new Set([
  "orange",
  "emerald",
  "blue",
  "purple",
  "cyan",
  "rose",
  "indigo",
  "amber",
  "violet",
  "sky",
  "pink",
  "red",
  "teal",
  "lime",
]);

const parseEvents = (value) => {
  let events = value;
  if (typeof events === "string") {
    try {
      events = JSON.parse(events);
    } catch {
      throw new Error("Events must be a valid array");
    }
  }

  if (!Array.isArray(events) || events.length === 0) {
    throw new Error("Add at least one journey event");
  }

  return events.map((event, index) => {
    const title = String(event?.title || "").trim();
    const description = String(event?.description || "").trim();
    if (!title || !description) {
      throw new Error(`Title and description are required for event ${index + 1}`);
    }
    return { title, description };
  });
};

const validatePayload = (body, { partial = false } = {}) => {
  const data = {};

  if (!partial || body.year !== undefined) {
    const year = Number(body.year);
    if (!Number.isInteger(year) || year < 1800 || year > 2200) {
      throw new Error("Enter a valid year between 1800 and 2200");
    }
    data.year = year;
  }

  if (!partial || body.icon_key !== undefined) {
    const iconKey = String(body.icon_key || "").trim();
    if (!ICON_KEYS.has(iconKey)) throw new Error("Select a valid icon");
    data.icon_key = iconKey;
  }

  if (body.color_key !== undefined) {
    const colorKey = String(body.color_key || "").trim();
    if (!COLOR_KEYS.has(colorKey)) throw new Error("Select a valid color");
    data.color_key = colorKey;
  } else if (!partial) {
    data.color_key = "blue";
  }

  if (body.side !== undefined) {
    const side = String(body.side || "").trim();
    if (!["left", "right"].includes(side)) throw new Error("Select a valid side");
    data.side = side;
  } else if (!partial) {
    data.side = "left";
  }

  if (body.display_order !== undefined) {
    const displayOrder = Number(body.display_order);
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      throw new Error("Display order must be zero or a positive whole number");
    }
    data.display_order = displayOrder;
  }

  if (!partial || body.status !== undefined) {
    const status = String(body.status || "active").trim();
    if (!["active", "inactive"].includes(status)) throw new Error("Select a valid status");
    data.status = status;
  }

  if (!partial || body.events !== undefined) data.events = parseEvents(body.events);
  return data;
};

const getPublicJourneyMilestones = async (req, res) => {
  try {
    const milestones = await journeyMilestoneDao.getJourneyMilestones();
    return ok(res, "Journey milestones fetched successfully", { milestones });
  } catch (err) {
    console.error("Get public journey milestones error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getAdminJourneyMilestones = async (req, res) => {
  try {
    const milestones = await journeyMilestoneDao.getJourneyMilestones({ includeInactive: true });
    return ok(res, "Journey milestones fetched successfully", { milestones });
  } catch (err) {
    console.error("Get admin journey milestones error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getJourneyMilestoneById = async (req, res) => {
  try {
    const milestone = await journeyMilestoneDao.getJourneyMilestoneById(req.params.id);
    if (!milestone) return error(res, 404, "Journey milestone not found");
    return ok(res, "Journey milestone fetched successfully", milestone);
  } catch (err) {
    console.error("Get journey milestone error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const createJourneyMilestone = async (req, res) => {
  try {
    let data;
    try {
      data = validatePayload(req.body);
    } catch (validationError) {
      return error(res, 400, validationError.message, { code: "INVALID_DATA" });
    }
    const milestone = await journeyMilestoneDao.createJourneyMilestone({
      ...data,
      created_by: req.user?.id || null,
    });
    return created(res, "Journey milestone created successfully", milestone);
  } catch (err) {
    console.error("Create journey milestone error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateJourneyMilestone = async (req, res) => {
  try {
    const existing = await journeyMilestoneDao.getJourneyMilestoneById(req.params.id);
    if (!existing) return error(res, 404, "Journey milestone not found");

    let data;
    try {
      data = validatePayload(req.body, { partial: true });
    } catch (validationError) {
      return error(res, 400, validationError.message, { code: "INVALID_DATA" });
    }
    if (Object.keys(data).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    const milestone = await journeyMilestoneDao.updateJourneyMilestone(req.params.id, data);
    return ok(res, "Journey milestone updated successfully", milestone);
  } catch (err) {
    console.error("Update journey milestone error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteJourneyMilestone = async (req, res) => {
  try {
    const deleted = await journeyMilestoneDao.deleteJourneyMilestone(req.params.id);
    if (!deleted) return error(res, 404, "Journey milestone not found");
    return ok(res, "Journey milestone deleted successfully");
  } catch (err) {
    console.error("Delete journey milestone error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const reorderJourneyMilestones = async (req, res) => {
  try {
    const milestoneIds = req.body?.milestone_ids;
    if (
      !Array.isArray(milestoneIds) ||
      milestoneIds.length === 0 ||
      milestoneIds.some((id) => typeof id !== "string" || !id.trim()) ||
      new Set(milestoneIds).size !== milestoneIds.length
    ) {
      return error(res, 400, "Provide a valid milestone order", {
        code: "INVALID_MILESTONE_ORDER",
      });
    }

    await journeyMilestoneDao.reorderJourneyMilestones(milestoneIds);
    const milestones = await journeyMilestoneDao.getJourneyMilestones({ includeInactive: true });
    return ok(res, "Journey milestones reordered successfully", { milestones });
  } catch (err) {
    console.error("Reorder journey milestones error:", err);
    const statusCode = err.code === "MILESTONE_NOT_FOUND" ? 400 : 500;
    return error(res, statusCode, err.message || "Internal server error");
  }
};

module.exports = {
  getPublicJourneyMilestones,
  getAdminJourneyMilestones,
  getJourneyMilestoneById,
  createJourneyMilestone,
  updateJourneyMilestone,
  deleteJourneyMilestone,
  reorderJourneyMilestones,
};
