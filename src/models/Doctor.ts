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
    const [rows] = await db.query<RowDataPacket[]>(query, [doctorId]);
    return rows[0] || null;
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

  /**
   * Mengambil jadwal ketersediaan seorang dokter
   */
  static async getAvailability(doctorId: number) {
    const query = 'SELECT * FROM doctor_availability WHERE doctor_id = ? AND is_available = TRUE';
    const [rows] = await db.query(query, [doctorId]);
    return rows;
  }

  /**
   * Mengecek apakah sebuah slot waktu sudah di-booking
   */
  static async getBookedSlots(doctorId: number, date: string) {
    const query = `
      SELECT appointment_date FROM appointments 
      WHERE doctor_id = ? AND DATE(appointment_date) = ? AND status = 'Scheduled'
    `;
    const [rows] = await db.query(query, [doctorId, date]);
    return rows;
  }

  /**
   * (Untuk Admin) Menambahkan atau mengupdate jadwal ketersediaan dokter
   */
  static async setAvailability(doctorId: number, availability: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>) {
    await db.query('DELETE FROM doctor_availability WHERE doctor_id = ?', [doctorId]);

    if (availability.length === 0) return;

    const query = 'INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES ?';
    const values = availability.map(slot => [doctorId, slot.day_of_week, slot.start_time, slot.end_time]);
    
    return db.query(query, [values]);
  }
}