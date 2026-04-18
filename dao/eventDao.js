const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const EVENT_TABLE = "gcs_events";
const GALLERY_TABLE = "gcs_event_gallery_images";

const mapEventWithGallery = (event, galleryRows) => ({
  ...event,
  gallery_images: galleryRows.filter((item) => item.event_id === event.id),
});

const getGalleryImagesByEventId = async (eventId) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${GALLERY_TABLE} WHERE event_id = ? ORDER BY display_order ASC, created_at ASC`,
    [eventId],
  );
  return rows;
};

const getAllEvents = async () => {
  const [events] = await pool.query(
    `SELECT * FROM ${EVENT_TABLE} ORDER BY event_date DESC, created_at DESC`,
  );

  if (events.length === 0) {
    return [];
  }

  const [galleryRows] = await pool.query(
    `SELECT * FROM ${GALLERY_TABLE} ORDER BY display_order ASC, created_at ASC`,
  );

  return events.map((event) => mapEventWithGallery(event, galleryRows));
};

const getEventById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${EVENT_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const galleryImages = await getGalleryImagesByEventId(id);
  return {
    ...rows[0],
    gallery_images: galleryImages,
  };
};

const createEvent = async (eventData) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const id = uuidv4();
    const {
      title,
      description,
      thumbnail_image_url,
      thumbnail_image_key,
      event_date,
      place,
      created_by,
      gallery_images,
    } = eventData;

    await connection.query(
      `INSERT INTO ${EVENT_TABLE}
        (id, title, description, thumbnail_image_url, thumbnail_image_key, event_date, place, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        description,
        thumbnail_image_url,
        thumbnail_image_key,
        event_date,
        place,
        created_by || null,
      ],
    );

    for (let index = 0; index < gallery_images.length; index += 1) {
      const item = gallery_images[index];
      await connection.query(
        `INSERT INTO ${GALLERY_TABLE}
          (id, event_id, image_url, image_key, display_order)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), id, item.image_url, item.image_key, index + 1],
      );
    }

    await connection.commit();
    return getEventById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateEvent = async (id, data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { gallery_images, ...eventFields } = data;
    const fieldEntries = Object.entries(eventFields);

    if (fieldEntries.length > 0) {
      const fields = fieldEntries.map(([key]) => `${key} = ?`).join(", ");
      const values = fieldEntries.map(([, value]) => value);

      await connection.query(
        `UPDATE ${EVENT_TABLE} SET ${fields} WHERE id = ?`,
        [...values, id],
      );
    }

    if (gallery_images) {
      await connection.query(`DELETE FROM ${GALLERY_TABLE} WHERE event_id = ?`, [id]);

      for (let index = 0; index < gallery_images.length; index += 1) {
        const item = gallery_images[index];
        await connection.query(
          `INSERT INTO ${GALLERY_TABLE}
            (id, event_id, image_url, image_key, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), id, item.image_url, item.image_key, index + 1],
        );
      }
    }

    await connection.commit();
    return getEventById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteEvent = async (id) => {
  const existing = await getEventById(id);
  if (!existing) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${EVENT_TABLE} WHERE id = ?`, [id]);
  if (result.affectedRows === 0) {
    return null;
  }

  return {
    thumbnailImageKey: existing.thumbnail_image_key,
    galleryImageKeys: existing.gallery_images.map((item) => item.image_key),
  };
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
