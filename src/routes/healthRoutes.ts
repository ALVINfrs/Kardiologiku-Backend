import { Router } from "express";
import { addHealthData, getHealthData } from "../controllers/healthController";
import { protect } from "../middleware/authMiddleware"; // Impor middleware kita

const router = Router();

// Terapkan middleware 'protect' pada semua route di bawah ini
// Artinya, hanya user yang sudah login (membawa token) yang bisa mengaksesnya

// Route untuk menambahkan data (POST /api/health)
router.post("/", protect, addHealthData);

// Route untuk mengambil data (GET /api/health)
router.get("/", protect, getHealthData);

export default router;
