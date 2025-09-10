import db from "../config/database";

// Tipe untuk data obat
export interface IMedication {
  id?: number;
  user_id: number;
  name: string;
  dosage: string;
  stock: number;
  notes?: string;
}

export class Medication {
  /**
   * Menambahkan obat baru untuk seorang pengguna
   */
  static async create(medData: IMedication) {
    const query = "INSERT INTO medications SET ?";
    return db.query(query, medData);
  }

  /**
   * Mengambil semua daftar obat milik seorang pengguna
   */
  static async findByUserId(userId: number) {
    const query =
      "SELECT * FROM medications WHERE user_id = ? ORDER BY name ASC";
    const [rows] = await db.query(query, [userId]);
    return rows;
  }

  /**
   * Mengupdate data obat (termasuk stok)
   */
  static async update(
    medId: number,
    userId: number,
    medData: Partial<IMedication>
  ) {
    const query = "UPDATE medications SET ? WHERE id = ? AND user_id = ?";
    return db.query(query, [medData, medId, userId]);
  }

  /**
   * Menghapus obat dari daftar pengguna
   */
  static async delete(medId: number, userId: number) {
    const query = "DELETE FROM medications WHERE id = ? AND user_id = ?";
    return db.query(query, [medId, userId]);
  }

  /**
   * Mencatat bahwa sebuah obat telah diminum
   */
  static async logTaken(userId: number, medicationId: number) {
    // Kurangi stok saat obat diminum
    const decrementStockQuery =
      "UPDATE medications SET stock = stock - 1 WHERE id = ? AND user_id = ? AND stock > 0";
    await db.query(decrementStockQuery, [medicationId, userId]);

    // Catat ke dalam log
    const logQuery =
      "INSERT INTO medication_log (user_id, medication_id) VALUES (?, ?)";
    return db.query(logQuery, [userId, medicationId]);
  }
}
