import { Request, Response } from "express";
import { HealthData, IHealthData } from "../models/HealthData";
import { HealthInsightService } from "../services/healthInsightService";
/**
 * Menambahkan entri data kesehatan baru untuk pengguna yang sedang login.
 */
export const addHealthData = async (req: Request, res: Response) => {
  const userIdString = req.user?.id;

  if (!userIdString) {
    return res.status(401).json({ message: "User not found" });
  }

  // --- PERBAIKAN DI SINI ---
  // Konversi tipe data userId dari string ke number
  const userId = parseInt(userIdString, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  // --- AKHIR PERBAIKAN ---

  const { systolic_pressure, diastolic_pressure, heart_rate, activity_level } =
    req.body;

  const newData: IHealthData = {
    user_id: userId, // Sekarang sudah menjadi number
    systolic_pressure,
    diastolic_pressure,
    heart_rate,
    activity_level,
  };

  try {
    await HealthData.create(newData);
    res.status(201).json({ message: "Health data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding health data" });
  }
};

/**
 * Mendapatkan semua riwayat data kesehatan milik pengguna yang sedang login.
 */
export const getHealthData = async (req: Request, res: Response) => {
  const userIdString = req.user?.id;

  if (!userIdString) {
    return res.status(401).json({ message: "User not found" });
  }

  const userId = parseInt(userIdString, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const data = await HealthData.findByUserId(userId);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while fetching health data" });
  }
};

export const getHealthInsights = async (req: Request, res: Response) => {
  const userIdString = req.user?.id;

  if (!userIdString) {
    return res.status(401).json({ message: "User not found" });
  }

  const userId = parseInt(userIdString, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const insights = await HealthInsightService.generateInsights(userId);
    res.status(200).json({ insights });
  } catch (error) {
    console.error("Error generating health insights:", error);
    res.status(500).json({ message: "Server error while generating insights" });
  }
};
