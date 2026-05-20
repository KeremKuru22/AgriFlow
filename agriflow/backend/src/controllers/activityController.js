const pool = require("../database/db");

const getActivities = async (req, res) => {
  try {
    const { activityType } = req.query;

    let query = `
      SELECT fa.*, f.field_name
      FROM farm_activities fa
      JOIN fields f ON fa.field_id = f.id
      WHERE fa.user_id = $1
    `;

    const values = [req.user.id];

    if (activityType) {
      values.push(`%${activityType}%`);
      query += ` AND fa.activity_type ILIKE $${values.length}`;
    }

    query += " ORDER BY fa.activity_date DESC, fa.id DESC";

    const result = await pool.query(query, values);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get activities error:", error.message);
    return res.status(500).json({
      message: "Server error while getting activities.",
    });
  }
};

const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT fa.*, f.field_name
       FROM farm_activities fa
       JOIN fields f ON fa.field_id = f.id
       WHERE fa.id = $1 AND fa.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Activity not found.",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get activity by id error:", error.message);
    return res.status(500).json({
      message: "Server error while getting activity.",
    });
  }
};

const createActivity = async (req, res) => {
  try {
    const { fieldId, activityType, activityDate, description, cost } = req.body;

    if (!fieldId || !activityType || !activityDate) {
      return res.status(400).json({
        message: "Field, activity type and activity date are required.",
      });
    }

    if (cost !== undefined && Number(cost) < 0) {
      return res.status(400).json({
        message: "Cost cannot be negative.",
      });
    }

    const fieldCheck = await pool.query(
      "SELECT id FROM fields WHERE id = $1 AND user_id = $2",
      [fieldId, req.user.id]
    );

    if (fieldCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Field not found or does not belong to this user.",
      });
    }

    const result = await pool.query(
      `INSERT INTO farm_activities
       (user_id, field_id, activity_type, activity_date, description, cost)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user.id,
        fieldId,
        activityType,
        activityDate,
        description,
        cost || 0,
      ]
    );

    return res.status(201).json({
      message: "Activity created successfully.",
      activity: result.rows[0],
    });
  } catch (error) {
    console.error("Create activity error:", error.message);
    return res.status(500).json({
      message: "Server error while creating activity.",
    });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldId, activityType, activityDate, description, cost } = req.body;

    if (!fieldId || !activityType || !activityDate) {
      return res.status(400).json({
        message: "Field, activity type and activity date are required.",
      });
    }

    if (cost !== undefined && Number(cost) < 0) {
      return res.status(400).json({
        message: "Cost cannot be negative.",
      });
    }

    const fieldCheck = await pool.query(
      "SELECT id FROM fields WHERE id = $1 AND user_id = $2",
      [fieldId, req.user.id]
    );

    if (fieldCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Field not found or does not belong to this user.",
      });
    }

    const result = await pool.query(
      `UPDATE farm_activities
       SET field_id = $1,
           activity_type = $2,
           activity_date = $3,
           description = $4,
           cost = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        fieldId,
        activityType,
        activityDate,
        description,
        cost || 0,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Activity not found.",
      });
    }

    return res.status(200).json({
      message: "Activity updated successfully.",
      activity: result.rows[0],
    });
  } catch (error) {
    console.error("Update activity error:", error.message);
    return res.status(500).json({
      message: "Server error while updating activity.",
    });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM farm_activities WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Activity not found.",
      });
    }

    return res.status(200).json({
      message: "Activity deleted successfully.",
    });
  } catch (error) {
    console.error("Delete activity error:", error.message);
    return res.status(500).json({
      message: "Server error while deleting activity.",
    });
  }
};

module.exports = {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};