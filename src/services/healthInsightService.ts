import db from "../config/database";
import { RowDataPacket } from "mysql2";

// Tipe data untuk menampung statistik rata-rata
interface IHealthStats {
  avg_systolic: number | null;
  avg_diastolic: number | null;
  avg_heart_rate: number | null;
}

// Tipe data untuk log makanan yang relevan
interface IFoodLogStats extends RowDataPacket {
  log_date: Date;
  total_sodium: number;
}

export const HealthInsightService = {
  /**
   * Menghasilkan wawasan kesehatan cerdas untuk pengguna berdasarkan data seminggu terakhir.
   * @param userId - ID pengguna yang sedang login.
   */
  async generateInsights(userId: number): Promise<string[]> {
    const insights: string[] = [];

    // --- 1. Ambil data kesehatan untuk minggu ini dan minggu lalu ---
    const today = new Date();
    const endDateCurrentWeek = today.toISOString().split("T")[0];
    const startDateCurrentWeek = new Date(
      new Date().setDate(today.getDate() - 6)
    )
      .toISOString()
      .split("T")[0];
    const startDatePreviousWeek = new Date(
      new Date().setDate(today.getDate() - 13)
    )
      .toISOString()
      .split("T")[0];

    const currentWeekStats = await this.getAverageHealthStats(
      userId,
      startDateCurrentWeek,
      endDateCurrentWeek
    );
    const previousWeekStats = await this.getAverageHealthStats(
      userId,
      startDatePreviousWeek,
      startDateCurrentWeek
    );

    // --- 2. Bandingkan data dan hasilkan wawasan tekanan darah ---
    if (currentWeekStats.avg_systolic && previousWeekStats.avg_systolic) {
      const percentageChange =
        ((currentWeekStats.avg_systolic - previousWeekStats.avg_systolic) /
          previousWeekStats.avg_systolic) *
        100;

      if (percentageChange > 2) {
        insights.push(
          `Perhatian: Rata-rata tekanan darah sistolik Anda naik sekitar ${Math.round(
            percentageChange
          )}% dibandingkan minggu lalu. Pastikan Anda cukup istirahat.`
        );
      } else if (percentageChange < -2) {
        insights.push(
          `Kerja bagus! Rata-rata tekanan darah sistolik Anda turun sekitar ${Math.round(
            Math.abs(percentageChange)
          )}% dari minggu lalu. Pertahankan gaya hidup sehat Anda!`
        );
      } else {
        insights.push(
          "Tekanan darah Anda terpantau stabil minggu ini. Terus jaga konsistensi."
        );
      }
    } else if (currentWeekStats.avg_systolic) {
      insights.push(
        `Rata-rata tekanan darah sistolik Anda minggu ini adalah ${Math.round(
          currentWeekStats.avg_systolic
        )}. Data minggu lalu tidak cukup untuk perbandingan.`
      );
    }

    // --- 3. Analisis korelasi dengan konsumsi sodium (garam) ---
    const highSodiumDays = await this.getHighSodiumDays(
      userId,
      startDateCurrentWeek,
      endDateCurrentWeek
    );
    if (highSodiumDays.length > 2) {
      insights.push(
        `Kami mendeteksi Anda mengonsumsi makanan tinggi sodium sebanyak ${highSodiumDays.length} kali minggu ini. Konsumsi garam berlebih dapat memengaruhi tekanan darah.`
      );
    }

    // --- 4. Wawasan Detak Jantung ---
    if (currentWeekStats.avg_heart_rate) {
      if (currentWeekStats.avg_heart_rate > 90) {
        insights.push(
          `Rata-rata detak jantung Anda minggu ini (${Math.round(
            currentWeekStats.avg_heart_rate
          )} bpm) sedikit lebih tinggi dari normal. Apakah Anda sedang banyak beraktivitas atau stres?`
        );
      } else if (currentWeekStats.avg_heart_rate < 60) {
        insights.push(
          `Rata-rata detak jantung Anda minggu ini (${Math.round(
            currentWeekStats.avg_heart_rate
          )} bpm) cenderung rendah. Ini bisa jadi pertanda baik jika Anda rutin berolahraga.`
        );
      }
    }

    // Jika tidak ada data sama sekali
    if (insights.length === 0) {
      insights.push(
        "Data Anda belum cukup untuk dianalisis. Terus catat data kesehatan dan makanan Anda setiap hari untuk mendapatkan wawasan."
      );
    }

    return insights;
  },

  /**
   * Helper untuk mengambil rata-rata data kesehatan dari rentang tanggal.
   */
  async getAverageHealthStats(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<IHealthStats> {
    const query = `
        SELECT
            AVG(systolic_pressure) as avg_systolic,
            AVG(diastolic_pressure) as avg_diastolic,
            AVG(heart_rate) as avg_heart_rate
        FROM health_data
        WHERE user_id = ? AND created_at BETWEEN ? AND ?
      `;
    const [rows] = await db.query<RowDataPacket[]>(query, [
      userId,
      `${startDate} 00:00:00`,
      `${endDate} 23:59:59`,
    ]);
    return rows[0] as IHealthStats;
  },

  /**
   * Helper untuk mencari hari-hari dengan konsumsi sodium tinggi.
   */
  async getHighSodiumDays(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<IFoodLogStats[]> {
    const highSodiumThreshold = 2000; // (mg), rekomendasi harian
    const query = `
        SELECT fl.log_date, SUM(fi.sodium * fl.portion) as total_sodium
        FROM food_log fl
        JOIN food_items fi ON fl.food_id = fi.id
        WHERE fl.user_id = ? AND fl.log_date BETWEEN ? AND ?
        GROUP BY fl.log_date
        HAVING total_sodium > ?
      `;
    const [rows] = await db.query<IFoodLogStats[]>(query, [
      userId,
      startDate,
      endDate,
      highSodiumThreshold,
    ]);
    return rows;
  },
};
