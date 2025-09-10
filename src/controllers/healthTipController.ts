import { Request, Response } from "express";
import { HealthTip } from "../models/HealthTips";

/**
 * Mengambil dan mengirimkan satu tips kesehatan acak.
 */
export const getRandomTip = async (req: Request, res: Response) => {
  try {
    const tip = await HealthTip.getRandom();

    // Jika tidak ada tips di database
    if (!tip) {
      return res.status(404).json({ message: "Belum ada tips kesehatan." });
    }

    // Kirim tips sebagai respon
    res.status(200).json(tip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};
