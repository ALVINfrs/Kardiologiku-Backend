import { Router } from "express";
import { getMyReports } from "../controllers/reportController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Semua rute di bawah ini memerlukan login
router.use(protect);

// GET /api/reports -> Mendapatkan riwayat laporan pengguna yang login
router.get("/", getMyReports);

export default router;
