import { Router } from "express";
import {
  getRandomTip,
  getTipOfTheDay,
  getAllTips,
  createTip,
  updateTip,
  deleteTip,
} from "../controllers/healthTipController";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/adminMiddleware";

const router = Router();

// --- Rute untuk Pengguna (Publik) ---
// GET /api/tips/today -> Mendapatkan tip harian
router.get("/today", getTipOfTheDay);

// GET /api/tips/random -> Mendapatkan tip acak
// Bisa ditambah query: /api/tips/random?category=Diet
router.get("/random", getRandomTip);

// --- Rute untuk Admin (Dilindungi) ---
// Rute di bawah ini memerlukan login sebagai admin
router.use(protect, isAdmin);

// GET /api/tips -> Melihat semua tips
router.get("/", getAllTips);

// POST /api/tips -> Membuat tip baru
router.post("/", createTip);

// PUT /api/tips/:tipId -> Mengupdate tip
router.put("/:tipId", updateTip);

// DELETE /api/tips/:tipId -> Menghapus tip
router.delete("/:tipId", deleteTip);

export default router;
