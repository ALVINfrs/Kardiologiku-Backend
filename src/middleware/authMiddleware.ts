import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Definisikan interface untuk payload token kita
interface TokenPayload {
  id: string; // Ubah ke string untuk match dengan Express.TokenPayload
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface TokenPayload {
      id: string;
      email: string;
      role: string;
      iat: number;
      exp: number;
    }
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

      // Convert id to string if it's a number
      req.user = {
        ...decoded,
        id: decoded.id.toString(),
      };

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
