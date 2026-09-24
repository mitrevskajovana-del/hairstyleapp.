const express = require("express");

const router = express.Router();

const {
  getHairstyles,
  getHairstyleById,
  createHairstyle,
  updateHairstyle,
  deleteHairstyle,
  getTopHairstyles,
} = require("../controllers/hairstyleController");

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: Hairstyles
 *   description: Hairstyle management
 */

/**
 * @swagger
 * /api/hairstyles:
 *   get:
 *     summary: Get all hairstyles
 *     tags: [Hairstyles]
 *     responses:
 *       200:
 *         description: List of hairstyles
 */
router.get("/", getHairstyles);

/**
 * @swagger
 * /api/hairstyles/top:
 *   get:
 *     summary: Get top 3 most requested hairstyles
 *     tags: [Hairstyles]
 *     responses:
 *       200:
 *         description: Top 3 hairstyles based on appointments
 */
router.get("/top", getTopHairstyles);

/**
 * @swagger
 * /api/hairstyles/{id}:
 *   get:
 *     summary: Get one hairstyle
 *     tags: [Hairstyles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hairstyle details
 *       404:
 *         description: Hairstyle not found
 */
router.get("/:id", getHairstyleById);

/**
 * @swagger
 * /api/hairstyles:
 *   post:
 *     summary: Create a new hairstyle
 *     tags: [Hairstyles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Hairstyle created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  authMiddleware,
  adminOnly,
  createHairstyle
);

/**
 * @swagger
 * /api/hairstyles/{id}:
 *   put:
 *     summary: Update a hairstyle
 *     tags: [Hairstyles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hairstyle updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Hairstyle not found
 */
router.put(
  "/:id",
  authMiddleware,
  adminOnly,
  updateHairstyle
);

/**
 * @swagger
 * /api/hairstyles/{id}:
 *   delete:
 *     summary: Delete a hairstyle
 *     tags: [Hairstyles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hairstyle deleted successfully
 *       400:
 *         description: Hairstyle has existing appointments
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Hairstyle not found
 */
router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  deleteHairstyle
);

module.exports = router;