const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const MILESTONE_TABLE = "gcs_journey_milestones";
const EVENT_TABLE = "gcs_journey_milestone_events";

const attachEvents = (milestones, events) =>
  milestones.map((milestone) => ({
    ...milestone,
    events: events
      .filter((event) => event.milestone_id === milestone.id)
      .map(({ milestone_id, ...event }) => event),
  }));

const getJourneyMilestones = async ({ includeInactive = false } = {}) => {
  const whereClause = includeInactive ? "" : "WHERE status = 'active'";
  const [milestones] = await pool.query(
    `SELECT * FROM ${MILESTONE_TABLE} ${whereClause} ORDER BY display_order ASC, year DESC, created_at ASC`,
  );
  if (milestones.length === 0) return [];

  const milestoneIds = milestones.map((milestone) => milestone.id);
  const [events] = await pool.query(
    `SELECT * FROM ${EVENT_TABLE}
      WHERE milestone_id IN (?)
      ORDER BY display_order ASC, created_at ASC`,
    [milestoneIds],
  );
  return attachEvents(milestones, events);
};

const getJourneyMilestoneById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${MILESTONE_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) return null;

  const [events] = await pool.query(
    `SELECT * FROM ${EVENT_TABLE} WHERE milestone_id = ? ORDER BY display_order ASC, created_at ASC`,
    [id],
  );
  return attachEvents(rows, events)[0];
};

const insertEvents = async (connection, milestoneId, events) => {
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    await connection.query(
      `INSERT INTO ${EVENT_TABLE}
        (id, milestone_id, title, description, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), milestoneId, event.title, event.description, index + 1],
    );
  }
};

const createJourneyMilestone = async (data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const id = uuidv4();
    let displayOrder = data.display_order;
    if (displayOrder === undefined) {
      await connection.query(
        `UPDATE ${MILESTONE_TABLE} SET display_order = display_order + 1`,
      );
      displayOrder = 1;
    }
    await connection.query(
      `INSERT INTO ${MILESTONE_TABLE}
        (id, year, icon_key, color_key, side, display_order, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.year,
        data.icon_key,
        data.color_key,
        data.side,
        displayOrder,
        data.status,
        data.created_by || null,
      ],
    );
    await insertEvents(connection, id, data.events);
    await connection.commit();
    return getJourneyMilestoneById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateJourneyMilestone = async (id, data) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { events, ...milestoneFields } = data;
    const fieldEntries = Object.entries(milestoneFields);

    if (fieldEntries.length > 0) {
      const fields = fieldEntries.map(([key]) => `${key} = ?`).join(", ");
      const values = fieldEntries.map(([, value]) => value);
      await connection.query(`UPDATE ${MILESTONE_TABLE} SET ${fields} WHERE id = ?`, [
        ...values,
        id,
      ]);
    }

    if (events) {
      await connection.query(`DELETE FROM ${EVENT_TABLE} WHERE milestone_id = ?`, [id]);
      await insertEvents(connection, id, events);
    }

    await connection.commit();
    return getJourneyMilestoneById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteJourneyMilestone = async (id) => {
  const [result] = await pool.query(`DELETE FROM ${MILESTONE_TABLE} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

const reorderJourneyMilestones = async (milestoneIds) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (let index = 0; index < milestoneIds.length; index += 1) {
      const [result] = await connection.query(
        `UPDATE ${MILESTONE_TABLE} SET display_order = ? WHERE id = ?`,
        [index + 1, milestoneIds[index]],
      );
      if (result.affectedRows === 0) {
        const notFoundError = new Error("One or more journey milestones no longer exist");
        notFoundError.code = "MILESTONE_NOT_FOUND";
        throw notFoundError;
      }
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getJourneyMilestones,
  getJourneyMilestoneById,
  createJourneyMilestone,
  updateJourneyMilestone,
  deleteJourneyMilestone,
  reorderJourneyMilestones,
};
