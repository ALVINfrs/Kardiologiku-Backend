import { Request, Response } from "express";
import { HealthTip } from "../models/HealthTips";

// --- Controller untuk Pengguna ---

export const getTipOfTheDay = async (req: Request, res: Response) => {
  try {
    const tip = await HealthTip.getTipOfTheDay();
    res.status(200).json(tip);
  } catch (error) {
    console.error("Error fetching tip of the day:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRandomTip = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const tip = await HealthTip.getRandom(category as string | undefined);

    if (!tip) {
      return res.status(404).json({ message: "Health tip not found." });
    }
    res.status(200).json(tip);
  } catch (error) {
    console.error("Error fetching random tip:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Controller untuk Admin ---

export const getAllTips = async (req: Request, res: Response) => {
  try {
    const tips = await HealthTip.findAll();
    res.status(200).json(tips);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createTip = async (req: Request, res: Response) => {
  try {
    const { tip, category } = req.body;
    if (!tip || !category) {
      return res
        .status(400)
        .json({ message: "Tip and category are required." });
    }
    await HealthTip.create(tip, category);
    res.status(201).json({ message: "Health tip created successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTip = async (req: Request, res: Response) => {
  try {
    const { tipId } = req.params;
    const { tip, category } = req.body;
    if (!tip || !category) {
      return res
        .status(400)
        .json({ message: "Tip and category are required." });
    }
    await HealthTip.update(parseInt(tipId), tip, category);
    res.status(200).json({ message: "Health tip updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTip = async (req: Request, res: Response) => {
  try {
    const { tipId } = req.params;
    await HealthTip.delete(parseInt(tipId));
    res.status(200).json({ message: "Health tip deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
