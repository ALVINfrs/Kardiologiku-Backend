import db from "../config/database";
import { RowDataPacket } from "mysql2";

export class HealthTip {
  /**
   * Mengambil satu tips kesehatan secara acak dari database.
   */
  static async getRandom() {
    // Query untuk memilih satu baris secara acak
    const query =
      "SELECT tip, category FROM health_tips ORDER BY RAND() LIMIT 1";
    const [rows] = await db.query<RowDataPacket[]>(query);

    // Kembalikan baris pertama, atau null jika tidak ada data
    return rows[0] || null;
  }
}
