import express from "express";
import {
  register,
  login,
  getProfile,
  createAdmin,
} from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/profile", auth, getProfile);

router.post("/create-admin", createAdmin);

export default router;
