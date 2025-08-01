"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    // 1. Validasi Input
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }
    try {
        // 2. Cek apakah email sudah ada
        const [users] = yield database_1.default.query("SELECT email FROM users WHERE email = ?", [email]);
        if (users.length > 0) {
            return res.status(409).json({ message: "Email sudah terdaftar" });
        }
        // 3. Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // 4. Simpan ke database
        const newUser = { name, email, password: hashedPassword };
        yield database_1.default.query("INSERT INTO users SET ?", newUser);
        // 5. Kirim respon sukses
        res.status(201).json({ message: "Registrasi berhasil" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // 1. Validasi Input
    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password harus diisi" });
    }
    try {
        // 2. Cari pengguna berdasarkan email
        const [users] = yield database_1.default.query("SELECT * FROM users WHERE email = ?", [
            email,
        ]);
        if (users.length === 0) {
            return res.status(401).json({ message: "Email atau password salah" });
        }
        const user = users[0];
        // 3. Verifikasi password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Email atau password salah" });
        }
        // 4. Buat JWT Token
        const payload = {
            id: user.id,
            name: user.name,
        };
        const secret = process.env.JWT_SECRET || "fallback_secret";
        const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "1h" });
        // 5. Kirim token ke client
        res.status(200).json({
            message: "Login berhasil",
            token: token,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
});
exports.login = login;
