import { Router } from "express";
import { getAllUsers, getDashboardStats } from "../controllers/adminController";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/adminMiddleware"; // Impor middleware admin

const router = Router();

// Terapkan middleware 'protect' dan 'isAdmin' untuk semua rute di bawah ini
// Urutannya penting: cek login dulu, baru cek peran admin
router.use(protect, isAdmin);

// Endpoint untuk dasbor admin
router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);

// Contoh rute untuk manajemen konten
// router.put('/articles/:id', updateArticle);

export default router;
