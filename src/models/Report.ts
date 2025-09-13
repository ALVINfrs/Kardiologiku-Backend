import db from "../config/database";

export interface IWeeklyReport {
  user_id: number;
  start_date: string; // Diubah dari week_start_date
  end_date: string; // Diubah dari week_end_date
  summary_text: string | null; // Diubah dari summary_notes
  avg_systolic?: number | null;
  avg_diastolic?: number | null;
  avg_heart_rate?: number | null; // Ditambahkan
  medication_adherence?: number | null;
}

export class Report {
  /**
   * Menyimpan atau memperbarui data laporan mingguan.
   * Disesuaikan untuk menggunakan nama kolom Anda.
   */
  static async createOrUpdate(reportData: IWeeklyReport) {
    // Tambahkan UNIQUE KEY terlebih dahulu agar query ini berfungsi
    const query = `
        INSERT INTO weekly_reports SET ?
        ON DUPLICATE KEY UPDATE
            summary_text = VALUES(summary_text),
            avg_systolic = VALUES(avg_systolic),
            avg_diastolic = VALUES(avg_diastolic),
            avg_heart_rate = VALUES(avg_heart_rate),
            medication_adherence = VALUES(medication_adherence),
            sent_at = CURRENT_TIMESTAMP
    `;
    return db.query(query, reportData);
  }

  /**
   * Mengambil semua riwayat laporan milik seorang pengguna.
   * Disesuaikan untuk mengurutkan berdasarkan start_date.
   */
  static async findByUserId(userId: number) {
    const query =
      "SELECT * FROM weekly_reports WHERE user_id = ? ORDER BY start_date DESC";
    const [rows] = await db.query(query, [userId]);
    return rows;
  }
}
