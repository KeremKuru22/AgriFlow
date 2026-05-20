const pool = require("../database/db");
const {
  calculateYieldPerHectare,
  getYieldStatus,
} = require("../services/yieldService");

const getHarvests = async (req, res) => {
  try {
    const { seasonYear, cropType } = req.query;

    let query = `
      SELECT hr.*, f.field_name, f.field_area,
              CASE 
                WHEN hr.yield_per_hectare < 2000 THEN 'Low Yield'
                WHEN hr.yield_per_hectare >= 2000 AND hr.yield_per_hectare < 4000 THEN 'Normal Yield'
                ELSE 'High Yield'
              END AS yield_status
       FROM harvest_records hr
       JOIN fields f ON hr.field_id = f.id
       WHERE hr.user_id = $1
    `;

    const values = [req.user.id];

    if (seasonYear) {
      values.push(seasonYear);
      query += ` AND hr.season_year = $${values.length}`;
    }

    if (cropType) {
      values.push(`%${cropType}%`);
      query += ` AND hr.crop_type ILIKE $${values.length}`;
    }

    query += " ORDER BY hr.harvest_date DESC, hr.id DESC";

    const result = await pool.query(query, values);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get harvests error:", error.message);
    return res.status(500).json({
      message: "Server error while getting harvest records.",
    });
  }
};

const getHarvestById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT hr.*, f.field_name, f.field_area
       FROM harvest_records hr
       JOIN fields f ON hr.field_id = f.id
       WHERE hr.id = $1 AND hr.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Harvest record not found.",
      });
    }

    const harvest = result.rows[0];

    return res.status(200).json({
      ...harvest,
      yield_status: getYieldStatus(Number(harvest.yield_per_hectare)),
    });
  } catch (error) {
    console.error("Get harvest by id error:", error.message);
    return res.status(500).json({
      message: "Server error while getting harvest record.",
    });
  }
};

const createHarvest = async (req, res) => {
  try {
    const {
      fieldId,
      cropType,
      totalHarvestAmount,
      unit,
      harvestDate,
      seasonYear,
      notes,
    } = req.body;

    if (!fieldId || !cropType || !totalHarvestAmount || !harvestDate || !seasonYear) {
      return res.status(400).json({
        message:
          "Field, crop type, total harvest amount, harvest date and season year are required.",
      });
    }

    const fieldResult = await pool.query(
      "SELECT * FROM fields WHERE id = $1 AND user_id = $2",
      [fieldId, req.user.id]
    );

    if (fieldResult.rows.length === 0) {
      return res.status(404).json({
        message: "Field not found or does not belong to this user.",
      });
    }

    const field = fieldResult.rows[0];

    let yieldPerHectare;

    try {
      yieldPerHectare = calculateYieldPerHectare(
        totalHarvestAmount,
        field.field_area
      );
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    const result = await pool.query(
      `INSERT INTO harvest_records
       (user_id, field_id, crop_type, total_harvest_amount, unit, harvest_date, season_year, yield_per_hectare, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id,
        fieldId,
        cropType,
        totalHarvestAmount,
        unit || "kg",
        harvestDate,
        seasonYear,
        yieldPerHectare,
        notes,
      ]
    );

    return res.status(201).json({
      message: "Harvest record created successfully.",
      harvest: {
        ...result.rows[0],
        yield_status: getYieldStatus(yieldPerHectare),
      },
    });
  } catch (error) {
    console.error("Create harvest error:", error.message);
    return res.status(500).json({
      message: "Server error while creating harvest record.",
    });
  }
};

const updateHarvest = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fieldId,
      cropType,
      totalHarvestAmount,
      unit,
      harvestDate,
      seasonYear,
      notes,
    } = req.body;

    if (!fieldId || !cropType || !totalHarvestAmount || !harvestDate || !seasonYear) {
      return res.status(400).json({
        message:
          "Field, crop type, total harvest amount, harvest date and season year are required.",
      });
    }

    const fieldResult = await pool.query(
      "SELECT * FROM fields WHERE id = $1 AND user_id = $2",
      [fieldId, req.user.id]
    );

    if (fieldResult.rows.length === 0) {
      return res.status(404).json({
        message: "Field not found or does not belong to this user.",
      });
    }

    const field = fieldResult.rows[0];

    let yieldPerHectare;

    try {
      yieldPerHectare = calculateYieldPerHectare(
        totalHarvestAmount,
        field.field_area
      );
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    const result = await pool.query(
      `UPDATE harvest_records
       SET field_id = $1,
           crop_type = $2,
           total_harvest_amount = $3,
           unit = $4,
           harvest_date = $5,
           season_year = $6,
           yield_per_hectare = $7,
           notes = $8
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        fieldId,
        cropType,
        totalHarvestAmount,
        unit || "kg",
        harvestDate,
        seasonYear,
        yieldPerHectare,
        notes,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Harvest record not found.",
      });
    }

    return res.status(200).json({
      message: "Harvest record updated successfully.",
      harvest: {
        ...result.rows[0],
        yield_status: getYieldStatus(yieldPerHectare),
      },
    });
  } catch (error) {
    console.error("Update harvest error:", error.message);
    return res.status(500).json({
      message: "Server error while updating harvest record.",
    });
  }
};

const deleteHarvest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM harvest_records WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Harvest record not found.",
      });
    }

    return res.status(200).json({
      message: "Harvest record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete harvest error:", error.message);
    return res.status(500).json({
      message: "Server error while deleting harvest record.",
    });
  }
};

module.exports = {
  getHarvests,
  getHarvestById,
  createHarvest,
  updateHarvest,
  deleteHarvest,
};