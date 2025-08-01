import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/database";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // 1. Validasi Input
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  try {
    // 2. Cek apakah email sudah ada
    const [users]: any = await db.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );
    if (users.length > 0) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Simpan ke database
    const newUser = { name, email, password: hashedPassword };
    await db.query("INSERT INTO users SET ?", newUser);

    // 5. Kirim respon sukses
    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Validasi Input
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password harus diisi" });
  }

  try {
    // 2. Cari pengguna berdasarkan email
    const [users]: any = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Email atau password salah" });
    }
    const user = users[0];

    // 3. Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // 4. Buat JWT Token
    const payload = {
      id: user.id,
      name: user.name,
    };
    const secret = process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    // 5. Kirim token ke client
    res.status(200).json({
      message: "Login berhasil",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
