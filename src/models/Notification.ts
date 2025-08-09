import db from "../config/database";

export class Notification {
  /**
   * Mengambil semua notifikasi (belum dibaca & sudah dibaca) untuk seorang pengguna
   */
  static async findByUserId(userId: number) {
    const query =
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
    const [rows] = await db.query(query, [userId]);
    return rows;
  }

  /**
   * Menandai satu notifikasi sebagai sudah dibaca
   */
  static async markAsRead(notificationId: number, userId: number) {
    const query =
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?";
    return db.query(query, [notificationId, userId]);
  }

  /**
   * Menandai semua notifikasi sebagai sudah dibaca
   */
  static async markAllAsRead(userId: number) {
    const query = "UPDATE notifications SET is_read = TRUE WHERE user_id = ?";
    return db.query(query, [userId]);
  }
}
