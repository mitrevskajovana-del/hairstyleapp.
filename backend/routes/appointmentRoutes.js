const express = require("express");

const router = express.Router();

const {
  createAppointment,
  getAppointments,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableTimes,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authMiddleware,
  createAppointment
);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments (admin only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 */

router.get(
  "/",
  authMiddleware,
  adminOnly,
  getAppointments
);

/**
 * @swagger
 * /api/appointments/my:
 *   get:
 *     summary: Get current user's appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/my",
  authMiddleware,
  getMyAppointments
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get one appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/available",
  getAvailableTimes
);

router.get(
  "/:id",
  authMiddleware,
  getAppointmentById
);
/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  authMiddleware,
  updateAppointment
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  authMiddleware,
  deleteAppointment
);

module.exports = router;