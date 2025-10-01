import { Router } from "express";
import {
  addHealthData,
  getHealthData,
  getHealthInsights,
} from "../controllers/healthController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Terapkan middleware protect untuk semua routes
router.use(protect);

// Route untuk menambahkan data
router.post("/", addHealthData);

// Route untuk mengambil data
router.get("/", getHealthData);

// Route untuk mendapatkan wawasan kesehatan
router.get("/insights", getHealthInsights);

export default router;
