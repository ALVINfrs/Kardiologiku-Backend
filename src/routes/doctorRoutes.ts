import { Router } from "express";
import {
  getAllDoctors,
  getDoctorDetails,
  addReview,
  bookAppointment,
  getAvailableSlots,
  setDoctorAvailability,
} from "../controllers/doctorController";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdminMiddleware";

const router = Router();

// Endpoint yang bisa diakses publik (tanpa login)
router.get("/", getAllDoctors);
router.get("/:doctorId", getDoctorDetails);
router.get("/:doctorId/slots", getAvailableSlots);

// Endpoint yang butuh login (menggunakan middleware 'protect')
router.post("/:doctorId/reviews", protect, addReview);
router.post("/:doctorId/appointments", protect, bookAppointment);
router.put("/:doctorId/availability", protect, isAdmin, setDoctorAvailability);

export default router;
