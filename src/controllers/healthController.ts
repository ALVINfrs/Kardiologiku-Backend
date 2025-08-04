import { Request, Response } from "express";
import { HealthData, IHealthData } from "../models/HealthData";

/**
 * Menambahkan entri data kesehatan baru untuk pengguna yang sedang login.
 */
export const addHealthData = async (req: Request, res: Response) => {
  // Ambil user id dari middleware 'protect'
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "User not found" });
  }

  const { systolic_pressure, diastolic_pressure, heart_rate, activity_level } =
    req.body;

  const newData: IHealthData = {
    user_id: userId,
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
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "User not found" });
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
