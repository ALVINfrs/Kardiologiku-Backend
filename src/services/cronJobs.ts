import cron from "node-cron";
import db from "../config/database";
import { RowDataPacket } from "mysql2";
import { NotificationService } from "./notificationService";
import { Report, IWeeklyReport } from "../models/Report";
// Tipe data untuk hasil query
interface IMedicationStock extends RowDataPacket {
  user_id: number;
  name: string;
}

export const startScheduledJobs = () => {
  console.log("Scheduler is running...");

  // 1. Jalankan setiap hari jam 8 pagi untuk cek stok obat
  cron.schedule("0 8 * * *", async () => {
    console.log("[Cron Job] Running daily check for low medication stock...");
    try {
      const lowStockThreshold = 5;
      const [meds] = await db.query<IMedicationStock[]>(
        "SELECT user_id, name FROM medications WHERE stock <= ?",
        [lowStockThreshold]
      );

      for (const med of meds) {
        const message = `Peringatan: Stok obat "${med.name}" Anda akan segera habis. Segera siapkan resep baru.`;
        await NotificationService.create(med.user_id, message, "alert");
      }
    } catch (error) {
      console.error("Error during low stock check cron job:", error);
    }
  });

  // 2. (Contoh) Jalankan setiap 6 jam untuk mengingatkan logging
  cron.schedule("0 */6 * * *", async () => {
    console.log("[Cron Job] Running check for inactive users...");
    // Di sini Anda bisa menambahkan logika untuk mencari user yang tidak aktif
    // dan mengirimkan notifikasi 'reminder'.
  });

  // 3. (Lanjutan) Jalankan setiap Minggu jam 8 malam untuk laporan mingguan
  // cron.schedule('0 20 * * 0', async () => {
  //    console.log('[Cron Job] Generating weekly reports...');
  //    // Di sini Anda akan memanggil service untuk generate & kirim laporan email
  // });

  cron.schedule("0 20 * * 0", async () => {
    console.log("[Cron Job] Starting weekly health report generation...");
    try {
      const [users] = await db.query<RowDataPacket[]>("SELECT id FROM users");

      const today = new Date();
      const endDate = today.toISOString().split("T")[0]; // Minggu
      const startDate = new Date(new Date().setDate(today.getDate() - 6))
        .toISOString()
        .split("T")[0]; // Senin sebelumnya

      for (const user of users) {
        const userId = user.id;

        // 1. Hitung rata-rata data kesehatan (termasuk heart_rate)
        const [healthStats] = await db.query<RowDataPacket[]>(
          `
          SELECT
            AVG(systolic_pressure) as avg_systolic,
            AVG(diastolic_pressure) as avg_diastolic,
            AVG(heart_rate) as avg_heart_rate
          FROM health_data
          WHERE user_id = ? AND created_at BETWEEN ? AND ?
        `,
          [userId, `${startDate} 00:00:00`, `${endDate} 23:59:59`]
        );

        const { avg_systolic, avg_diastolic, avg_heart_rate } = healthStats[0];

        // 2. Buat catatan ringkasan (summary)
        let summary_text = "Laporan mingguan Anda telah dibuat.";
        if (avg_systolic && avg_systolic > 130) {
          summary_text +=
            " Perhatian: Rata-rata tekanan darah sistolik Anda minggu ini tampak tinggi. Terus pantau dan jaga pola makan.";
        } else if (avg_systolic && avg_systolic < 120) {
          summary_text +=
            " Tekanan darah Anda dalam rentang yang baik. Pertahankan!";
        }

        // 3. Simpan laporan ke database (sesuai skema Anda)
        const reportData: IWeeklyReport = {
          user_id: userId,
          start_date: startDate,
          end_date: endDate,
          summary_text: summary_text,
          // Bulatkan nilai agar sesuai dengan tipe data INT di tabel
          avg_systolic: avg_systolic ? Math.round(avg_systolic) : null,
          avg_diastolic: avg_diastolic ? Math.round(avg_diastolic) : null,
          avg_heart_rate: avg_heart_rate ? Math.round(avg_heart_rate) : null,
          medication_adherence: null, // Placeholder
        };
        await Report.createOrUpdate(reportData);

        // 4. Kirim notifikasi ke pengguna
        await NotificationService.create(
          userId,
          "Laporan kesehatan mingguan Anda sudah siap! Lihat ringkasan progres Anda.",
          "report"
        );
      }
      console.log(
        `[Cron Job] Weekly reports generated for ${users.length} users.`
      );
    } catch (error) {
      console.error("Error during weekly report generation cron job:", error);
    }
  });
};
