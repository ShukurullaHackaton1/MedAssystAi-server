import express from "express";
import {
  createChat,
  getUserChats,
  getChatById,
  sendMessage,
  closeChat,
} from "../controllers/chatController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Применяем middleware auth ко всем маршрутам
router.use(auth);

// Маршруты для чатов
router.post("/", createChat);
router.get("/", getUserChats);
router.get("/:id", getChatById);
router.post("/:id/messages", sendMessage);
router.put("/:id/close", closeChat);

export default router;
