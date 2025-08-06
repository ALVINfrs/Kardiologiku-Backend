import { Request, Response } from "express";
import { Doctor } from "../models/Doctor";

// Mendapatkan daftar semua dokter
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.findAll();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching doctors" });
  }
};

// Mendapatkan detail satu dokter beserta ulasannya
export const getDoctorDetails = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(parseInt(doctorId));
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    const reviews = await Doctor.findReviewsByDoctorId(parseInt(doctorId));

    res.status(200).json({ ...doctor, reviews });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching doctor details" });
  }
};

// Menambahkan ulasan baru untuk dokter
export const addReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { doctorId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    await Doctor.createReview(userId, parseInt(doctorId), rating, comment);
    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while adding review" });
  }
};

// Membuat janji temu
export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { doctorId } = req.params;
    const { appointmentDate, notes } = req.body; // Contoh `appointmentDate`: "2025-12-25 10:00:00"

    if (!appointmentDate) {
      return res.status(400).json({ message: "Appointment date is required" });
    }

    await Doctor.createAppointment(
      userId,
      parseInt(doctorId),
      appointmentDate,
      notes
    );
    res.status(201).json({ message: "Appointment booked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while booking appointment" });
  }
};
