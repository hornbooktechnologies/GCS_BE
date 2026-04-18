const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const CHECKUP_PLAN_TABLE = "gcs_checkup_plans";
const CHECKUP_PLAN_TEST_TABLE = "gcs_checkup_plan_tests";

const mapPlanWithTests = (plan, testRows) => ({
  ...plan,
  tests: testRows
    .filter((item) => item.checkup_plan_id === plan.id)
    .map(({ checkup_plan_id, ...rest }) => rest),
  test_names: testRows
    .filter((item) => item.checkup_plan_id === plan.id)
    .map((item) => item.test_name),
});

const getTestsByPlanId = async (planId) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${CHECKUP_PLAN_TEST_TABLE} WHERE checkup_plan_id = ? ORDER BY display_order ASC, created_at ASC`,
    [planId],
  );
  return rows;
};

const getAllCheckupPlans = async () => {
  const [plans] = await pool.query(
    `SELECT * FROM ${CHECKUP_PLAN_TABLE} ORDER BY created_at DESC`,
  );

  if (plans.length === 0) {
    return [];
  }

  const [testRows] = await pool.query(
    `SELECT * FROM ${CHECKUP_PLAN_TEST_TABLE} ORDER BY display_order ASC, created_at ASC`,
  );

  return plans.map((plan) => mapPlanWithTests(plan, testRows));
};

const getCheckupPlanById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ${CHECKUP_PLAN_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const tests = await getTestsByPlanId(id);
  return {
    ...rows[0],
    tests,
    test_names: tests.map((item) => item.test_name),
  };
};

const createCheckupPlan = async (data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const id = uuidv4();
    const {
      name,
      image_url,
      image_key,
      price,
      created_by,
      test_names,
    } = data;

    await connection.query(
      `INSERT INTO ${CHECKUP_PLAN_TABLE}
        (id, name, image_url, image_key, price, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, image_url, image_key, price, created_by || null],
    );

    for (let index = 0; index < test_names.length; index += 1) {
      await connection.query(
        `INSERT INTO ${CHECKUP_PLAN_TEST_TABLE}
          (id, checkup_plan_id, test_name, display_order)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), id, test_names[index], index + 1],
      );
    }

    await connection.commit();
    return getCheckupPlanById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateCheckupPlan = async (id, data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { test_names, ...planFields } = data;
    const fieldEntries = Object.entries(planFields);

    if (fieldEntries.length > 0) {
      const fields = fieldEntries.map(([key]) => `${key} = ?`).join(", ");
      const values = fieldEntries.map(([, value]) => value);
      await connection.query(
        `UPDATE ${CHECKUP_PLAN_TABLE} SET ${fields} WHERE id = ?`,
        [...values, id],
      );
    }

    if (test_names) {
      await connection.query(`DELETE FROM ${CHECKUP_PLAN_TEST_TABLE} WHERE checkup_plan_id = ?`, [id]);
      for (let index = 0; index < test_names.length; index += 1) {
        await connection.query(
          `INSERT INTO ${CHECKUP_PLAN_TEST_TABLE}
            (id, checkup_plan_id, test_name, display_order)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), id, test_names[index], index + 1],
        );
      }
    }

    await connection.commit();
    return getCheckupPlanById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteCheckupPlan = async (id) => {
  const [rows] = await pool.query(`SELECT image_key FROM ${CHECKUP_PLAN_TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return null;
  }

  const [result] = await pool.query(`DELETE FROM ${CHECKUP_PLAN_TABLE} WHERE id = ?`, [id]);
  if (result.affectedRows > 0) {
    return { imageKey: rows[0].image_key };
  }
  return null;
};

module.exports = {
  getAllCheckupPlans,
  getCheckupPlanById,
  createCheckupPlan,
  updateCheckupPlan,
  deleteCheckupPlan,
};
