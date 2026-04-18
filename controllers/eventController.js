const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const eventDao = require("../dao/eventDao");
const { ok, created, error } = require("../utils/responseHandler");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const deleteS3Object = async (key) => {
  if (!key) {
    return;
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }),
  );
};

const getAllEvents = async (req, res) => {
  try {
    const events = await eventDao.getAllEvents();
    return ok(res, "Events fetched successfully", { events });
  } catch (err) {
    console.error("Get events error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await eventDao.getEventById(req.params.id);
    if (!event) {
      return error(res, 404, "Event not found");
    }
    return ok(res, "Event fetched successfully", event);
  } catch (err) {
    console.error("Get event error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, event_date, place } = req.body;
    const thumbnailImage = req.files?.thumbnail_image?.[0];
    const galleryImages = req.files?.gallery_images || [];

    if (!title || !description || !event_date || !place) {
      return error(res, 400, "All event fields are required", {
        code: "MISSING_FIELDS",
      });
    }

    if (!thumbnailImage) {
      return error(res, 400, "Thumbnail image is required", {
        code: "MISSING_FILE",
      });
    }

    if (galleryImages.length === 0) {
      return error(res, 400, "At least one gallery image is required", {
        code: "MISSING_FILE",
      });
    }

    const event = await eventDao.createEvent({
      title,
      description,
      thumbnail_image_url: thumbnailImage.location,
      thumbnail_image_key: thumbnailImage.key,
      event_date,
      place,
      created_by: req.user ? req.user.id : null,
      gallery_images: galleryImages.map((file) => ({
        image_url: file.location,
        image_key: file.key,
      })),
    });

    return created(res, "Event created successfully", event);
  } catch (err) {
    console.error("Create event error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, place } = req.body;
    const thumbnailImage = req.files?.thumbnail_image?.[0];
    const galleryImages = req.files?.gallery_images || [];

    const existing = await eventDao.getEventById(id);
    if (!existing) {
      return error(res, 404, "Event not found");
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (event_date !== undefined) updateData.event_date = event_date;
    if (place !== undefined) updateData.place = place;

    if (thumbnailImage) {
      updateData.thumbnail_image_url = thumbnailImage.location;
      updateData.thumbnail_image_key = thumbnailImage.key;
    }

    if (galleryImages.length > 0) {
      updateData.gallery_images = galleryImages.map((file) => ({
        image_url: file.location,
        image_key: file.key,
      }));
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, 400, "No fields to update", { code: "NO_UPDATE_DATA" });
    }

    const event = await eventDao.updateEvent(id, updateData);

    if (thumbnailImage && existing.thumbnail_image_key) {
      try {
        await deleteS3Object(existing.thumbnail_image_key);
      } catch (s3Err) {
        console.error("Error deleting old event thumbnail from S3:", s3Err);
      }
    }

    if (galleryImages.length > 0) {
      for (const item of existing.gallery_images) {
        try {
          await deleteS3Object(item.image_key);
        } catch (s3Err) {
          console.error("Error deleting old event gallery image from S3:", s3Err);
        }
      }
    }

    return ok(res, "Event updated successfully", event);
  } catch (err) {
    console.error("Update event error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const result = await eventDao.deleteEvent(req.params.id);
    if (!result) {
      return error(res, 404, "Event not found");
    }

    try {
      await deleteS3Object(result.thumbnailImageKey);
    } catch (s3Err) {
      console.error("Error deleting event thumbnail from S3:", s3Err);
    }

    for (const key of result.galleryImageKeys) {
      try {
        await deleteS3Object(key);
      } catch (s3Err) {
        console.error("Error deleting event gallery image from S3:", s3Err);
      }
    }

    return ok(res, "Event deleted successfully");
  } catch (err) {
    console.error("Delete event error:", err);
    return error(res, 500, "Internal server error", { details: err.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
