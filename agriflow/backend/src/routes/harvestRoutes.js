const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getHarvests,
  getHarvestById,
  createHarvest,
  updateHarvest,
  deleteHarvest,
} = require("../controllers/harvestController");

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/harvests:
 *   get:
 *     summary: Get all harvest records of the logged-in farmer
 *     tags: [Harvests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of harvest records
 *       401:
 *         description: Unauthorized
 */
router.get("/", getHarvests);

/**
 * @swagger
 * /api/harvests/{id}:
 *   get:
 *     summary: Get a harvest record by id
 *     tags: [Harvests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Harvest record id
 *     responses:
 *       200:
 *         description: Harvest record details
 *       404:
 *         description: Harvest record not found
 */
router.get("/:id", getHarvestById);

/**
 * @swagger
 * /api/harvests:
 *   post:
 *     summary: Create a new harvest record and calculate yield automatically
 *     tags: [Harvests]
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
 *               - cropType
 *               - totalHarvestAmount
 *               - harvestDate
 *               - seasonYear
 *             properties:
 *               fieldId:
 *                 type: integer
 *                 example: 1
 *               cropType:
 *                 type: string
 *                 example: Wheat
 *               totalHarvestAmount:
 *                 type: number
 *                 example: 48000
 *               unit:
 *                 type: string
 *                 example: kg
 *               harvestDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-08-15
 *               seasonYear:
 *                 type: integer
 *                 example: 2026
 *               notes:
 *                 type: string
 *                 example: First wheat harvest of the season.
 *     responses:
 *       201:
 *         description: Harvest record created successfully
 *       400:
 *         description: Missing or invalid input
 *       404:
 *         description: Field not found
 */
router.post("/", createHarvest);

/**
 * @swagger
 * /api/harvests/{id}:
 *   put:
 *     summary: Update a harvest record and recalculate yield
 *     tags: [Harvests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Harvest record id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fieldId
 *               - cropType
 *               - totalHarvestAmount
 *               - harvestDate
 *               - seasonYear
 *             properties:
 *               fieldId:
 *                 type: integer
 *                 example: 1
 *               cropType:
 *                 type: string
 *                 example: Wheat
 *               totalHarvestAmount:
 *                 type: number
 *                 example: 52000
 *               unit:
 *                 type: string
 *                 example: kg
 *               harvestDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-08-20
 *               seasonYear:
 *                 type: integer
 *                 example: 2026
 *               notes:
 *                 type: string
 *                 example: Updated harvest amount.
 *     responses:
 *       200:
 *         description: Harvest record updated successfully
 *       404:
 *         description: Harvest record or field not found
 */
router.put("/:id", updateHarvest);

/**
 * @swagger
 * /api/harvests/{id}:
 *   delete:
 *     summary: Delete a harvest record
 *     tags: [Harvests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Harvest record id
 *     responses:
 *       200:
 *         description: Harvest record deleted successfully
 *       404:
 *         description: Harvest record not found
 */
router.delete("/:id", deleteHarvest);

module.exports = router;