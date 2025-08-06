import { Router } from "express";
import {
  getAllDoctors,
  getDoctorDetails,
  addReview,
  bookAppointment,
} from "../controllers/doctorController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Endpoint yang bisa diakses publik (tanpa login)
router.get("/", getAllDoctors);
router.get("/:doctorId", getDoctorDetails);

// Endpoint yang butuh login (menggunakan middleware 'protect')
router.post("/:doctorId/reviews", protect, addReview);
router.post("/:doctorId/appointments", protect, bookAppointment);

export default router;
