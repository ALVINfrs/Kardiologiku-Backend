import { Request, Response } from "express";
import { Doctor } from "../models/Doctor";
import { RowDataPacket } from "mysql2";

// Definisikan tipe data untuk slot ketersediaan agar tidak menggunakan 'any'
interface AvailabilitySlot extends RowDataPacket {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

// Definisikan tipe data untuk slot yang sudah di-booking
interface BookedSlot extends RowDataPacket {
  appointment_date: Date;
}

// Mendapatkan daftar semua dokter
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.findAll();
    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching doctors" });
  }
};

// Mendapatkan detail satu dokter beserta ulasannya
export const getDoctorDetails = async (req: Request, res: Response) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    if (isNaN(doctorId))
      return res.status(400).json({ message: "Invalid Doctor ID" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    const reviews = await Doctor.findReviewsByDoctorId(doctorId);

    res.status(200).json({ ...doctor, reviews });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while fetching doctor details" });
  }
};

// Menambahkan ulasan baru untuk dokter
export const addReview = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.user!.id);
    if (isNaN(userId))
      return res.status(400).json({ message: "Invalid User ID" });

    const doctorId = parseInt(req.params.doctorId);
    if (isNaN(doctorId))
      return res.status(400).json({ message: "Invalid Doctor ID" });

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    await Doctor.createReview(userId, doctorId, rating, comment);
    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding review" });
  }
};

// Membuat janji temu
export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user!.id);
    const doctorId = parseInt(req.params.doctorId, 10);
    const { appointmentDate, notes } = req.body; // Contoh `appointmentDate`: "2025-12-25 10:00:00"

    if (!appointmentDate) {
      return res.status(400).json({ message: "Appointment date is required" });
    }

    await Doctor.createAppointment(userId, doctorId, appointmentDate, notes);
    res.status(201).json({ message: "Appointment booked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while booking appointment" });
  }
};

// Mendapatkan slot waktu yang tersedia untuk seorang dokter pada tanggal tertentu
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    if (isNaN(doctorId))
      return res.status(400).json({ message: "Invalid Doctor ID" });

    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(400).json({
        message: "Date query parameter is required in YYYY-MM-DD format",
      });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getUTCDay();

    const availability = (await Doctor.getAvailability(
      doctorId
    )) as AvailabilitySlot[];
    const scheduleForDay = availability.find(
      (s) => s.day_of_week === dayOfWeek
    );

    if (!scheduleForDay) {
      return res.status(200).json([]);
    }

    const bookedSlots = (await Doctor.getBookedSlots(
      doctorId,
      date
    )) as BookedSlot[];
    const bookedTimes = new Set(
      bookedSlots.map((s) =>
        new Date(s.appointment_date).toTimeString().substring(0, 5)
      )
    );

    const availableSlots: string[] = [];
    const consultationDuration = 30;

    let currentTime = new Date(`${date}T${scheduleForDay.start_time}`);
    const endTime = new Date(`${date}T${scheduleForDay.end_time}`);

    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().substring(0, 5);
      if (!bookedTimes.has(timeString)) {
        availableSlots.push(timeString);
      }
      currentTime.setMinutes(currentTime.getMinutes() + consultationDuration);
    }

    res.status(200).json(availableSlots);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while fetching available slots" });
  }
};

// (Untuk Admin) Mengatur jadwal ketersediaan dokter
export const setDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const doctorId = parseInt(req.params.doctorId, 10);
    const { availability } = req.body; // array of { day_of_week, start_time, end_time }

    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: "Availability must be an array" });
    }

    await Doctor.setAvailability(doctorId, availability);
    res
      .status(200)
      .json({ message: "Doctor availability updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while setting availability" });
  }
};
