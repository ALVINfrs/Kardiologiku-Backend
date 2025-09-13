import { Request, Response } from "express";
import { Report } from "../models/Report";

export const getMyReports = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.user!.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const reports = await Report.findByUserId(userId);
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error while fetching reports." });
  }
};
