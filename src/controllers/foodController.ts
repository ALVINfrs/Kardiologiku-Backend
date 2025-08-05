import { Request, Response } from "express";
import { Food } from "../models/Food";

// ... (fungsi searchFood dan addCustomFood tetap sama)

export const searchFood = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const searchTerm = (req.query.q as string) || "";

  try {
    const results = await Food.search(userId, searchTerm);
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during food search" });
  }
};

export const addCustomFood = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name, calories, sodium, potassium, fat, protein, carbs, category } =
    req.body;

  if (!name || calories === undefined || sodium === undefined) {
    return res
      .status(400)
      .json({ message: "Nama, kalori, dan sodium wajib diisi" });
  }

  try {
    await Food.createCustom({ ...req.body, user_id: userId });
    res.status(201).json({ message: "Makanan kustom berhasil ditambahkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding custom food" });
  }
};

// --- PERBAIKAN UTAMA ADA DI FUNGSI INI ---
export const logFood = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { food_id, meal_type, portion, log_date } = req.body;

  if (!food_id || !meal_type || !log_date) {
    return res.status(400).json({ message: "Data log tidak lengkap" });
  }

  // **AWAL PERBAIKAN**
  // 1. Buat objek Date dari string yang dikirim client.
  const dateObject = new Date(log_date);

  // 2. Cek apakah tanggal yang dikirim valid.
  if (isNaN(dateObject.getTime())) {
    return res
      .status(400)
      .json({ message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD." });
  }

  // 3. Format tanggal menjadi 'YYYY-MM-DD' yang pasti diterima MySQL.
  const formattedDate = dateObject.toISOString().split("T")[0];
  // **AKHIR PERBAIKAN**

  try {
    // Gunakan tanggal yang sudah diformat
    await Food.log({
      user_id: userId,
      food_id,
      meal_type,
      portion,
      log_date: formattedDate,
    });
    res.status(201).json({ message: "Makanan berhasil dicatat" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while logging food" });
  }
};

// ... (fungsi getDailyLog dan deleteFoodLog tetap sama)

export const getDailyLog = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const date =
    (req.query.date as string) || new Date().toISOString().split("T")[0];

  try {
    const logs = await Food.getLogByDate(userId, date);
    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching food log" });
  }
};

export const deleteFoodLog = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { logId } = req.params;

  try {
    await Food.deleteLog(parseInt(logId, 10), userId);
    res.status(200).json({ message: "Catatan makanan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting food log" });
  }
};
