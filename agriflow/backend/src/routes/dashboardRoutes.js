const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getYieldSummary,
  getDashboardStats,
} = require("../controllers/dashboardController");

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics for the logged-in farmer
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", getDashboardStats);

/**
 * @swagger
 * /api/dashboard/yield-summary:
 *   get:
 *     summary: Get yearly yield summary grouped by year and crop type
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Yearly yield summary
 *       401:
 *         description: Unauthorized
 */
router.get("/yield-summary", getYieldSummary);

module.exports = router;