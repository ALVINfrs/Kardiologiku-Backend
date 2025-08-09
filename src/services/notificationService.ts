import db from "../config/database";

export type NotificationType =
  | "alert"
  | "reminder"
  | "report"
  | "info"
  | "success";

export const NotificationService = {
  /**
   * Membuat notifikasi baru untuk seorang pengguna.
   * @param userId - ID pengguna yang akan menerima notifikasi.
   * @param message - Isi pesan notifikasi.
   * @param type - Jenis notifikasi.
   */
  async create(userId: number, message: string, type: NotificationType) {
    try {
      const query =
        "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)";
      await db.query(query, [userId, message, type]);
      console.log(`Notification created for user ${userId}: "${message}"`);
    } catch (error) {
      console.error(`Failed to create notification for user ${userId}:`, error);
    }
  },
};
