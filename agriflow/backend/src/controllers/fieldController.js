const pool = require("../database/db");

const getFields = async (req, res) => {
  try {
    const { city, cropType } = req.query;

    let query = "SELECT * FROM fields WHERE user_id = $1";
    const values = [req.user.id];

    if (city) {
      values.push(`%${city}%`);
      query += ` AND city ILIKE $${values.length}`;
    }

    if (cropType) {
      values.push(`%${cropType}%`);
      query += ` AND crop_type ILIKE $${values.length}`;
    }

    query += " ORDER BY id DESC";

    const result = await pool.query(query, values);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get fields error:", error.message);
    return res.status(500).json({
      message: "Server error while getting fields.",
    });
  }
};

const getFieldById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM fields WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Field not found.",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get field by id error:", error.message);
    return res.status(500).json({
      message: "Server error while getting field.",
    });
  }
};

const createField = async (req, res) => {
  try {
    const {
      fieldName,
      city,
      district,
      cropType,
      fieldArea,
      soilType,
      plantingDate,
      description,
    } = req.body;

    if (!fieldName || !city || !cropType || !fieldArea) {
      return res.status(400).json({
        message: "Field name, city, crop type and field area are required.",
      });
    }

    if (Number(fieldArea) <= 0) {
      return res.status(400).json({
        message: "Field area must be greater than zero.",
      });
    }

    const result = await pool.query(
      `INSERT INTO fields 
      (user_id, field_name, city, district, crop_type, field_area, soil_type, planting_date, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        req.user.id,
        fieldName,
        city,
        district,
        cropType,
        fieldArea,
        soilType,
        plantingDate,
        description,
      ]
    );

    return res.status(201).json({
      message: "Field created successfully.",
      field: result.rows[0],
    });
  } catch (error) {
    console.error("Create field error:", error.message);
    return res.status(500).json({
      message: "Server error while creating field.",
    });
  }
};

const updateField = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fieldName,
      city,
      district,
      cropType,
      fieldArea,
      soilType,
      plantingDate,
      description,
    } = req.body;

    if (!fieldName || !city || !cropType || !fieldArea) {
      return res.status(400).json({
        message: "Field name, city, crop type and field area are required.",
      });
    }

    if (Number(fieldArea) <= 0) {
      return res.status(400).json({
        message: "Field area must be greater than zero.",
      });
    }

    const result = await pool.query(
      `UPDATE fields
       SET field_name = $1,
           city = $2,
           district = $3,
           crop_type = $4,
           field_area = $5,
           soil_type = $6,
           planting_date = $7,
           description = $8
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        fieldName,
        city,
        district,
        cropType,
        fieldArea,
        soilType,
        plantingDate,
        description,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Field not found.",
      });
    }

    return res.status(200).json({
      message: "Field updated successfully.",
      field: result.rows[0],
    });
  } catch (error) {
    console.error("Update field error:", error.message);
    return res.status(500).json({
      message: "Server error while updating field.",
    });
  }
};

const deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM fields WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Field not found.",
      });
    }

    return res.status(200).json({
      message: "Field deleted successfully.",
    });
  } catch (error) {
    console.error("Delete field error:", error.message);
    return res.status(500).json({
      message: "Server error while deleting field.",
    });
  }
};

module.exports = {
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
};