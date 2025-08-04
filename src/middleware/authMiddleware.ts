import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Definisikan interface untuk payload token kita
interface TokenPayload {
  id: number;
  name: string;
  iat: number;
  exp: number;
}

// Tambahkan properti 'user' ke dalam interface Request dari Express
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// PASTIKAN ADA KATA "EXPORT" DI SINI
export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Cek apakah header authorization ada dan formatnya benar
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Ambil token dari header (Contoh: "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // Verifikasi token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as TokenPayload;

      // Simpan payload user ke dalam request agar bisa digunakan oleh controller
      req.user = decoded;

      next(); // Lanjutkan ke controller jika token valid
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
