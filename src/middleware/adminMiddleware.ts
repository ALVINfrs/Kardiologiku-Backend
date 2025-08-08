import { Request, Response, NextFunction } from "express";
import db from "../config/database";
import { RowDataPacket } from "mysql2";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const query = "SELECT role FROM users WHERE id = ?";
    const [rows] = await db.query<RowDataPacket[]>(query, [userId]);

    if (rows.length > 0 && rows[0].role === "admin") {
      next(); // Lanjutkan jika user adalah admin
    } else {
      res.status(403).json({ message: "Access denied. Admin role required." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while verifying admin role" });
  }
};
