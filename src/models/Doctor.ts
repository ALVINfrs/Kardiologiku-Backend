import db from "../config/database";
import { RowDataPacket } from "mysql2";

export class Doctor {
  /**
   * Mengambil daftar semua dokter dengan rating rata-rata
   */
  static async findAll() {
    const query = `
            SELECT 
                d.*, 
                AVG(dr.rating) as average_rating, 
                COUNT(dr.id) as reviews_count
            FROM doctors d
            LEFT JOIN doctor_reviews dr ON d.id = dr.doctor_id
            GROUP BY d.id
            ORDER BY d.name ASC
        `;
    const [rows] = await db.query(query);
    return rows;
  }

  /**
   * Mengambil detail satu dokter berdasarkan ID
   */
  static async findById(doctorId: number) {
    const query = "SELECT * FROM doctors WHERE id = ?";

    // --- AWAL PERBAIKAN ---
    // 1. Jalankan query dan simpan hasilnya ke variabel `rows`
    const [rows] = await db.query<RowDataPacket[]>(query, [doctorId]);

    // 2. Cek apakah ada hasilnya, lalu ambil elemen pertama
    const doctor = rows[0] || null;
    // --- AKHIR PERBAIKAN ---

    return doctor;
  }

  /**
   * Mengambil semua ulasan untuk satu dokter
   */
  static async findReviewsByDoctorId(doctorId: number) {
    const query = `
            SELECT dr.rating, dr.comment, dr.review_date, u.name as patient_name
            FROM doctor_reviews dr
            JOIN users u ON dr.user_id = u.id
            WHERE dr.doctor_id = ?
            ORDER BY dr.review_date DESC
        `;
    const [rows] = await db.query(query, [doctorId]);
    return rows;
  }

  /**
   * Membuat ulasan baru
   */
  static async createReview(
    userId: number,
    doctorId: number,
    rating: number,
    comment: string
  ) {
    const review = {
      user_id: userId,
      doctor_id: doctorId,
      rating,
      comment,
      review_date: new Date().toISOString().split("T")[0],
    };
    const query = "INSERT INTO doctor_reviews SET ?";
    return db.query(query, review);
  }

  /**
   * Membuat janji temu baru
   */
  static async createAppointment(
    userId: number,
    doctorId: number,
    appointmentDate: string,
    notes: string
  ) {
    const appointment = {
      user_id: userId,
      doctor_id: doctorId,
      appointment_date: appointmentDate,
      notes,
    };
    const query = "INSERT INTO appointments SET ?";
    return db.query(query, appointment);
  }
}
