import { Router } from "express";
import {
  getAllArticles,
  getArticleBySlug,
  createArticle,
} from "../controllers/articleController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Endpoint publik untuk membaca artikel
router.get("/", getAllArticles);
router.get("/:slug", getArticleBySlug);

// Endpoint yang dilindungi untuk membuat artikel (asumsi hanya admin)
// Di masa depan, Anda bisa buat middleware khusus admin di sini
router.post("/", protect, createArticle);

export default router;
