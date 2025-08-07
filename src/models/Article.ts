import db from "../config/database";
import { RowDataPacket } from "mysql2"; // Impor tipe ini

export class Article {
  /**
   * Mengambil semua artikel yang sudah di-publish
   */
  static async findAllPublished() {
    const query = `
            SELECT id, title, slug, excerpt, category, difficulty, image_url, published_at 
            FROM articles 
            WHERE status = 'Published' 
            ORDER BY published_at DESC
        `;
    const [rows] = await db.query(query);
    return rows;
  }

  /**
   * Mengambil satu artikel berdasarkan slug-nya
   */
  static async findBySlug(slug: string) {
    const query =
      "SELECT * FROM articles WHERE slug = ? AND status = 'Published'";

    // --- AWAL PERBAIKAN ---
    // 1. Jalankan query dan berikan tipe yang benar pada hasilnya
    const [rows] = await db.query<RowDataPacket[]>(query, [slug]);

    // 2. Ambil artikel pertama dari array `rows`
    // Jika tidak ada, kembalikan `null`
    const article = rows[0] || null;
    // --- AKHIR PERBAIKAN ---

    return article;
  }

  /**
   * (Untuk Admin) Membuat artikel baru
   */
  static async create(articleData: any) {
    // Logika untuk membuat slug unik dari judul
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const dataToSave = { ...articleData, slug };

    const query = "INSERT INTO articles SET ?";
    return db.query(query, dataToSave);
  }
}
