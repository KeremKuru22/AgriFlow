const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
} = require("../controllers/fieldController");

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/fields:
 *   get:
 *     summary: Get all fields of the logged-in farmer
 *     tags: [Fields]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of fields
 *       401:
 *         description: Unauthorized
 */
router.get("/", getFields);

/**
 * @swagger
 * /api/fields/{id}:
 *   get:
 *     summary: Get a field by id
 *     tags: [Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Field id
 *     responses:
 *       200:
 *         description: Field details
 *       404:
 *         description: Field not found
 */
router.get("/:id", getFieldById);

/**
 * @swagger
 * /api/fields:
 *   post:
 *     summary: Create a new field
 *     tags: [Fields]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fieldName
 *               - city
 *               - cropType
 *               - fieldArea
 *             properties:
 *               fieldName:
 *                 type: string
 *                 example: North Field
 *               city:
 *                 type: string
 *                 example: Konya
 *               district:
 *                 type: string
 *                 example: Karatay
 *               cropType:
 *                 type: string
 *                 example: Wheat
 *               fieldArea:
 *                 type: number
 *                 example: 12.5
 *               soilType:
 *                 type: string
 *                 example: Loamy
 *               plantingDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-15
 *               description:
 *                 type: string
 *                 example: Main wheat field
 *     responses:
 *       201:
 *         description: Field created successfully
 *       400:
 *         description: Missing or invalid input
 */
router.post("/", createField);

/**
 * @swagger
 * /api/fields/{id}:
 *   put:
 *     summary: Update a field
 *     tags: [Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Field id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fieldName
 *               - city
 *               - cropType
 *               - fieldArea
 *             properties:
 *               fieldName:
 *                 type: string
 *                 example: Updated North Field
 *               city:
 *                 type: string
 *                 example: Konya
 *               district:
 *                 type: string
 *                 example: Karatay
 *               cropType:
 *                 type: string
 *                 example: Wheat
 *               fieldArea:
 *                 type: number
 *                 example: 15
 *               soilType:
 *                 type: string
 *                 example: Loamy
 *               plantingDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-15
 *               description:
 *                 type: string
 *                 example: Updated wheat field
 *     responses:
 *       200:
 *         description: Field updated successfully
 *       404:
 *         description: Field not found
 */
router.put("/:id", updateField);

/**
 * @swagger
 * /api/fields/{id}:
 *   delete:
 *     summary: Delete a field
 *     tags: [Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Field id
 *     responses:
 *       200:
 *         description: Field deleted successfully
 *       404:
 *         description: Field not found
 */
router.delete("/:id", deleteField);

module.exports = router;