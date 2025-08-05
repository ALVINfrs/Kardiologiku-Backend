import db from "../config/database";

export interface IFoodItem {
  id?: number;
  name: string;
  calories: number;
  sodium: number;
  potassium: number;
  fat: number;
  protein: number;
  carbs: number;
  category: "Buah" | "Sayur" | "Protein" | "Karbohidrat" | "Lainnya";
  user_id?: number | null; // ID user jika ini makanan kustom
}

export interface IFoodLog {
  id?: number;
  user_id: number;
  food_id: number;
  meal_type: "Sarapan" | "Makan Siang" | "Makan Malam" | "Camilan";
  portion: number;
  log_date: string; // Format 'YYYY-MM-DD'
}

export class Food {
  /**
   * Mencari makanan dari database (default + kustom milik user)
   * @param userId ID pengguna untuk mengambil makanan kustom miliknya
   * @param searchTerm Kata kunci pencarian
   */
  static async search(userId: number, searchTerm: string = "") {
    const query = `
            SELECT * FROM food_items 
            WHERE (user_id IS NULL OR user_id = ?) 
            AND name LIKE ?
            ORDER BY name ASC
        `;
    const [rows] = await db.query(query, [userId, `%${searchTerm}%`]);
    return rows;
  }

  /**
   * Membuat item makanan kustom baru
   * @param foodData Data makanan baru
   */
  static async createCustom(foodData: IFoodItem) {
    const query = "INSERT INTO food_items SET ?";
    return db.query(query, foodData);
  }

  /**
   * Menambahkan entri log makanan
   * @param logData Data log makanan
   */
  static async log(logData: IFoodLog) {
    const query = "INSERT INTO food_log SET ?";
    return db.query(query, logData);
  }

  /**
   * Mengambil log makanan pengguna pada tanggal tertentu
   * @param userId ID pengguna
   * @param date Tanggal log (YYYY-MM-DD)
   */
  static async getLogByDate(userId: number, date: string) {
    const query = `
            SELECT fl.id, fl.meal_type, fl.portion, fi.name, fi.calories, fi.sodium, fi.potassium, fi.fat, fi.protein, fi.carbs 
            FROM food_log fl
            JOIN food_items fi ON fl.food_id = fi.id
            WHERE fl.user_id = ? AND fl.log_date = ?
            ORDER BY fl.created_at ASC
        `;
    const [rows] = await db.query(query, [userId, date]);
    return rows;
  }

  /**
   * Menghapus entri log makanan
   * @param logId ID log makanan
   * @param userId ID pengguna (untuk keamanan)
   */
  static async deleteLog(logId: number, userId: number) {
    const query = "DELETE FROM food_log WHERE id = ? AND user_id = ?";
    return db.query(query, [logId, userId]);
  }
}
