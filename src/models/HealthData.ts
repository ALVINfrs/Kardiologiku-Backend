import db from "../config/database";

// Definisikan tipe untuk data kesehatan
export interface IHealthData {
  id?: number;
  user_id: number;
  systolic_pressure?: number;
  diastolic_pressure?: number;
  heart_rate?: number;
  activity_level?: string;
}

export class HealthData {
  /**
   * Menyimpan data kesehatan baru ke database
   * @param data Objek data kesehatan
   */
  static async create(data: IHealthData) {
    const query = "INSERT INTO health_data SET ?";
    return db.query(query, data);
  }

  /**
   * Mengambil semua riwayat data kesehatan milik seorang pengguna
   * @param userId ID dari pengguna
   */
  static async findByUserId(userId: number) {
    const query =
      "SELECT * FROM health_data WHERE user_id = ? ORDER BY created_at DESC";
    const [rows] = await db.query(query, [userId]);
    return rows;
  }
}
