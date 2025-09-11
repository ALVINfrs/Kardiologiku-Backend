import db from "../config/database";
import { RowDataPacket } from "mysql2";

export class HealthTip {
  /**
   * Mengambil "Tip of the Day".
   * Jika untuk hari ini belum ada, maka akan memilih satu secara acak,
   * menyimpannya, lalu mengembalikannya.
   */
  static async getTipOfTheDay() {
    const today = new Date().toISOString().split("T")[0];

    // Cek apakah sudah ada tip untuk hari ini
    let [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, tip, category FROM health_tips WHERE tip_date = ?",
      [today]
    );

    if (rows.length > 0) {
      return rows[0]; // Jika ada, langsung kembalikan
    }

    // Jika tidak ada, pilih satu tip acak yang belum pernah menjadi tip harian
    [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, tip, category FROM health_tips WHERE tip_date IS NULL ORDER BY RAND() LIMIT 1"
    );

    // Jika semua tips sudah pernah jadi tip harian, reset salah satu
    if (rows.length === 0) {
      [rows] = await db.query<RowDataPacket[]>(
        "SELECT id, tip, category FROM health_tips ORDER BY RAND() LIMIT 1"
      );
    }

    const selectedTip = rows[0];

    // Tandai sebagai "Tip of the Day"
    await db.query("UPDATE health_tips SET tip_date = ? WHERE id = ?", [
      today,
      selectedTip.id,
    ]);

    return selectedTip;
  }

  /**
   * Mengambil satu tips kesehatan secara acak, bisa difilter berdasarkan kategori.
   * @param category - Kategori tips (opsional)
   */
  static async getRandom(category?: string) {
    let query = "SELECT tip, category FROM health_tips";
    const params: string[] = [];

    if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }

    query += " ORDER BY RAND() LIMIT 1";
    const [rows] = await db.query<RowDataPacket[]>(query, params);
    return rows[0] || null;
  }

  // --- Metode untuk Admin ---

  /** (Admin) Mengambil semua tips */
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM health_tips ORDER BY id DESC");
    return rows;
  }

  /** (Admin) Membuat tip baru */
  static async create(tip: string, category: string) {
    const query = "INSERT INTO health_tips (tip, category) VALUES (?, ?)";
    const [result] = await db.query(query, [tip, category]);
    return result;
  }

  /** (Admin) Memperbarui tip */
  static async update(id: number, tip: string, category: string) {
    const query = "UPDATE health_tips SET tip = ?, category = ? WHERE id = ?";
    const [result] = await db.query(query, [tip, category, id]);
    return result;
  }

  /** (Admin) Menghapus tip */
  static async delete(id: number) {
    const [result] = await db.query("DELETE FROM health_tips WHERE id = ?", [
      id,
    ]);
    return result;
  }
}
