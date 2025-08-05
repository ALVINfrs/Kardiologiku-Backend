import { Router } from "express";
import {
  searchFood,
  addCustomFood,
  logFood,
  getDailyLog,
  deleteFoodLog,
} from "../controllers/foodController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Semua rute di bawah ini dilindungi oleh middleware 'protect'
router.use(protect);

// Endpoint untuk mencari makanan
// GET /api/food/search?q=nasi
router.get("/search", searchFood);

// Endpoint untuk makanan kustom
// POST /api/food/custom
router.post("/custom", addCustomFood);

// Endpoint untuk log harian
// GET /api/food/log?date=2024-08-05
router.get("/log", getDailyLog);
// POST /api/food/log
router.post("/log", logFood);
// DELETE /api/food/log/:logId
router.delete("/log/:logId", deleteFoodLog);

export default router;
