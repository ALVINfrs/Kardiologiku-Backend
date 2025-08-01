import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// UBAH BAGIAN INI: Tambahkan "export" dan jadikan const
export const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    // Tambahkan emoji agar lebih keren di terminal!
    console.log("🎉 Database MySQL Connected Successfully!");
    connection.release();
  } catch (error) {
    console.error("❌ Failed to connect to the Database:", error);
    // Hentikan aplikasi jika koneksi gagal
    process.exit(1);
  }
};

export default pool;
