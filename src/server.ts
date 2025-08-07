import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import healthRoutes from "./routes/healthRoutes";
import foodRoutes from "./routes/foodRoutes";
import medicationRoutes from "./routes/medicationRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import articleRoutes from "./routes/articleRoutes";

// 1. Impor fungsi yang sudah kita ekspor
import { testDbConnection } from "./config/database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/articles", articleRoutes);

app.get("/", (req, res) => {
  res.send("Selamat datang di Kardiologiku API!");
});

// 2. Buat fungsi async untuk memulai server
const startServer = async () => {
  // Panggil tes koneksi terlebih dahulu
  await testDbConnection();

  // Jika koneksi berhasil, baru jalankan server
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
};

// 3. Jalankan fungsi startServer
startServer();
