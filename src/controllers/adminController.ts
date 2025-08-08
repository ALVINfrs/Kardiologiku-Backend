import { Request, Response } from "express";
import db from "../config/database";
import { RowDataPacket } from "mysql2"; // <-- 1. Impor tipe RowDataPacket

// Melihat semua pengguna
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role, created_at FROM users"
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

// --- PERBAIKAN UTAMA ADA DI FUNGSI INI ---
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 2. Ambil hasil query satu per satu dengan cara yang aman
    const [userRows] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM users"
    );
    const userCount = userRows[0].count;

    const [doctorRows] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM doctors"
    );
    const doctorCount = doctorRows[0].count;

    const [articleRows] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM articles"
    );
    const articleCount = articleRows[0].count;

    res.status(200).json({
      totalUsers: userCount,
      totalDoctors: doctorCount,
      totalArticles: articleCount,
    });
  } catch (error) {
    console.error(error); // Tambahkan console.error untuk debugging
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};

// Controller untuk artikel (bisa dipindah atau diperluas dari articleController)
export const updateArticle = async (req: Request, res: Response) => {
  // Logika untuk admin mengupdate artikel...
  res.status(200).json({
    message: "Article updated successfully (logic to be implemented)",
  });
};
