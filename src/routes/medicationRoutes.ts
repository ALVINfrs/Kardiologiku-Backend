import { Router } from "express";
import {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  logMedicationTaken,
} from "../controllers/medicationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Terapkan middleware 'protect' untuk semua rute di bawah ini
router.use(protect);

// Rute untuk mendapatkan semua obat dan menambah obat baru
router.route("/").get(getMedications).post(addMedication);

// Rute untuk mengupdate dan menghapus obat berdasarkan ID
router.route("/:medId").put(updateMedication).delete(deleteMedication);

// Rute untuk mencatat obat telah diminum
router.post("/:medId/log", logMedicationTaken);

export default router;
