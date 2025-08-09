import cron from "node-cron";
import db from "../config/database";
import { RowDataPacket } from "mysql2";
import { NotificationService } from "./notificationService";

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
};
