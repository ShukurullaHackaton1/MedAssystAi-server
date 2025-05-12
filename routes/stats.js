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

// Маршруты для статистики (только для админов)
router.get("/symptoms", getSymptomStats);
router.get("/daily", getDailyStats);
router.get("/diagnosis", getDiagnosisStats);
router.get("/overall", getOverallStats);

export default router;
