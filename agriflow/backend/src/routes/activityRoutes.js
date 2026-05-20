const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all farm activities of the logged-in farmer
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of farm activities
 *       401:
 *         description: Unauthorized
 */
router.get("/", getActivities);

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Get a farm activity by id
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity id
 *     responses:
 *       200:
 *         description: Activity details
 *       404:
 *         description: Activity not found
 */
router.get("/:id", getActivityById);

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Create a new farm activity
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fieldId
 *               - activityType
 *               - activityDate
 *             properties:
 *               fieldId:
 *                 type: integer
 *                 example: 1
 *               activityType:
 *                 type: string
 *                 example: Fertilization
 *               activityDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-10
 *               description:
 *                 type: string
 *                 example: Nitrogen fertilizer applied before growth stage.
 *               cost:
 *                 type: number
 *                 example: 2500
 *     responses:
 *       201:
 *         description: Activity created successfully
 *       400:
 *         description: Missing or invalid input
 *       404:
 *         description: Field not found
 */
router.post("/", createActivity);

/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Update a farm activity
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fieldId
 *               - activityType
 *               - activityDate
 *             properties:
 *               fieldId:
 *                 type: integer
 *                 example: 1
 *               activityType:
 *                 type: string
 *                 example: Pesticide
 *               activityDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-05-05
 *               description:
 *                 type: string
 *                 example: Pest control applied to wheat field.
 *               cost:
 *                 type: number
 *                 example: 1800
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *       404:
 *         description: Activity or field not found
 */
router.put("/:id", updateActivity);

/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: Delete a farm activity
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity id
 *     responses:
 *       200:
 *         description: Activity deleted successfully
 *       404:
 *         description: Activity not found
 */
router.delete("/:id", deleteActivity);

module.exports = router;