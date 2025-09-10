import { Router } from "express";
import { getRandomTip } from "../controllers/healthTipController";

const router = Router();

// Endpoint publik untuk mendapatkan tip kesehatan
// URL: GET http://localhost:5000/api/tips
router.get("/", getRandomTip);

export default router;
