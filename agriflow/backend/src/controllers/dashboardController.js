const pool = require("../database/db");

const getYieldSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
          season_year,
          crop_type,
          COUNT(*) AS harvest_count,
          SUM(total_harvest_amount) AS total_harvest,
          AVG(yield_per_hectare) AS average_yield,
          MIN(yield_per_hectare) AS lowest_yield,
          MAX(yield_per_hectare) AS highest_yield
       FROM harvest_records
       WHERE user_id = $1
       GROUP BY season_year, crop_type
       ORDER BY season_year DESC, crop_type ASC`,
      [req.user.id]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Yield summary error:", error.message);
    return res.status(500).json({
      message: "Server error while getting yield summary.",
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const fieldsResult = await pool.query(
      "SELECT COUNT(*) AS total_fields FROM fields WHERE user_id = $1",
      [req.user.id]
    );

    const activitiesResult = await pool.query(
      "SELECT COUNT(*) AS total_activities FROM farm_activities WHERE user_id = $1",
      [req.user.id]
    );

    const harvestResult = await pool.query(
      `SELECT 
          COUNT(*) AS total_harvest_records,
          COALESCE(SUM(total_harvest_amount), 0) AS total_harvest_amount,
          COALESCE(AVG(yield_per_hectare), 0) AS average_yield
       FROM harvest_records
       WHERE user_id = $1`,
      [req.user.id]
    );

    const lowYieldResult = await pool.query(
      `SELECT COUNT(*) AS low_yield_count
       FROM harvest_records
       WHERE user_id = $1 AND yield_per_hectare < 2000`,
      [req.user.id]
    );

    return res.status(200).json({
      totalFields: Number(fieldsResult.rows[0].total_fields),
      totalActivities: Number(activitiesResult.rows[0].total_activities),
      totalHarvestRecords: Number(harvestResult.rows[0].total_harvest_records),
      totalHarvestAmount: Number(harvestResult.rows[0].total_harvest_amount),
      averageYield: Number(Number(harvestResult.rows[0].average_yield).toFixed(2)),
      lowYieldCount: Number(lowYieldResult.rows[0].low_yield_count),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    return res.status(500).json({
      message: "Server error while getting dashboard statistics.",
    });
  }
};

module.exports = {
  getYieldSummary,
  getDashboardStats,
};