const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const SYMPOTM_TABLE = "gcs_sympotms";
const POTENTIAL_CAUSE_TABLE = "gcs_sympotm_potential_causes";

const mapSympotmWithPotentialCauses = (sympotm, potentialCauseRows) => ({
  ...sympotm,
  potential_causes: potentialCauseRows
    .filter((item) => item.sympotm_id === sympotm.id)
    .map(({ sympotm_id, ...rest }) => rest),
});

const getPotentialCausesBySympotmId = async (sympotmId) => {
  const [rows] = await pool.query(
    `SELECT *
     FROM ${POTENTIAL_CAUSE_TABLE}
     WHERE sympotm_id = ?
     ORDER BY display_order ASC, created_at ASC`,
    [sympotmId],
  );
  return rows;
};

const getAllSympotms = async () => {
  const [sympotms] = await pool.query(
    `SELECT *
     FROM ${SYMPOTM_TABLE}
     ORDER BY created_at DESC`,
  );

  if (sympotms.length === 0) {
    return [];
  }

  const [potentialCauseRows] = await pool.query(
    `SELECT *
     FROM ${POTENTIAL_CAUSE_TABLE}
     ORDER BY display_order ASC, created_at ASC`,
  );

  return sympotms.map((item) => mapSympotmWithPotentialCauses(item, potentialCauseRows));
};

const getSympotmById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${SYMPOTM_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const potentialCauses = await getPotentialCausesBySympotmId(id);

  return {
    ...rows[0],
    potential_causes: potentialCauses.map(({ sympotm_id, ...rest }) => rest),
  };
};

const createSympotm = async (data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const id = uuidv4();
    const { name, subtitle, image_url, image_key, potential_causes, created_by } = data;

    await connection.query(
      `INSERT INTO ${SYMPOTM_TABLE}
        (id, name, subtitle, image_url, image_key, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, subtitle, image_url, image_key, created_by || null],
    );

    for (let index = 0; index < potential_causes.length; index += 1) {
      const item = potential_causes[index];
      await connection.query(
        `INSERT INTO ${POTENTIAL_CAUSE_TABLE}
          (id, sympotm_id, title, description, display_order)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), id, item.title, item.description, index + 1],
      );
    }

    await connection.commit();
    return getSympotmById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateSympotm = async (id, data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { potential_causes, ...sympotmFields } = data;
    const fieldEntries = Object.entries(sympotmFields);

    if (fieldEntries.length > 0) {
      const fields = fieldEntries.map(([key]) => `${key} = ?`).join(", ");
      const values = fieldEntries.map(([, value]) => value);
      await connection.query(
        `UPDATE ${SYMPOTM_TABLE}
         SET ${fields}
         WHERE id = ?`,
        [...values, id],
      );
    }

    if (potential_causes) {
      await connection.query(
        `DELETE FROM ${POTENTIAL_CAUSE_TABLE}
         WHERE sympotm_id = ?`,
        [id],
      );

      for (let index = 0; index < potential_causes.length; index += 1) {
        const item = potential_causes[index];
        await connection.query(
          `INSERT INTO ${POTENTIAL_CAUSE_TABLE}
            (id, sympotm_id, title, description, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), id, item.title, item.description, index + 1],
        );
      }
    }

    await connection.commit();
    return getSympotmById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteSympotm = async (id) => {
  const existing = await getSympotmById(id);
  if (!existing) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${SYMPOTM_TABLE} WHERE id = ?`, [id]);
  if (result.affectedRows === 0) {
    return null;
  }

  return {
    imageKey: existing.image_key,
  };
};

module.exports = {
  getAllSympotms,
  getSympotmById,
  createSympotm,
  updateSympotm,
  deleteSympotm,
};
