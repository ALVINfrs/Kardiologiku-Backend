"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// Konfigurasi environment variables dari file .env
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware untuk membaca request body dalam format JSON
app.use(express_1.default.json());
// Menggunakan routes yang telah kita definisikan
app.use("/api/auth", authRoutes_1.default);
// Route dasar untuk testing
app.get("/", (req, res) => {
    res.send("Selamat datang di Kardiologiku API!");
});
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
