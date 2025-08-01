import { Router } from "express";
import { register, login } from "../controllers/authController";

const router = Router();

// Endpoint untuk registrasi
// URL: POST http://localhost:3000/api/auth/register
router.post("/register", register);

// Endpoint untuk login
// URL: POST http://localhost:3000/api/auth/login
router.post("/login", login);

export default router;
