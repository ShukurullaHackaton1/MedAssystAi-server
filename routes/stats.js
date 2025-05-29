import express from "express";
import {
  getSymptomStats,
  getDailyStats,
  getDiagnosisStats,
  getOverallStats,
} from "../controllers/statsController.js";
import { auth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

// Применяем middleware adminAuth ко всем маршрутам
router.use(auth);
router.use(adminAuth);

/**
 * @swagger
 * /api/stats/symptoms:
 *   get:
 *     summary: Get symptom statistics (Admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Symptom statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   symptom:
 *                     type: string
 *                   count:
 *                     type: number
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/symptoms", getSymptomStats);

/**
 * @swagger
 * /api/stats/daily:
 *   get:
 *     summary: Get daily statistics (Admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Daily statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                   count:
 *                     type: number
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/daily", getDailyStats);

/**
 * @swagger
 * /api/stats/diagnosis:
 *   get:
 *     summary: Get diagnosis statistics (Admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Diagnosis statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   diagnosis:
 *                     type: string
 *                   count:
 *                     type: number
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/diagnosis", getDiagnosisStats);

/**
 * @swagger
 * /api/stats/overall:
 *   get:
 *     summary: Get overall statistics (Admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/overall", getOverallStats);

export default router;
