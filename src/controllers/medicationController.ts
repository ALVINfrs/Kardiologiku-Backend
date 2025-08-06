import { Request, Response } from "express";
import { Medication } from "../models/Medication";

// Mendapatkan semua obat milik pengguna
export const getMedications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const medications = await Medication.findByUserId(userId);
    res.status(200).json(medications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching medications" });
  }
};

// Menambahkan obat baru
export const addMedication = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, dosage, stock, notes } = req.body;

    if (!name || !dosage || stock === undefined) {
      return res
        .status(400)
        .json({ message: "Nama, dosis, dan stok wajib diisi" });
    }

    await Medication.create({ user_id: userId, ...req.body });
    res.status(201).json({ message: "Obat berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: "Server error while adding medication" });
  }
};

// Mengupdate obat
export const updateMedication = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { medId } = req.params;
    const { name, dosage, stock, notes } = req.body;

    if (!name && !dosage && stock === undefined && !notes) {
      return res.status(400).json({ message: "Tidak ada data untuk diupdate" });
    }

    await Medication.update(parseInt(medId), userId, req.body);
    res.status(200).json({ message: "Obat berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating medication" });
  }
};

// Menghapus obat
export const deleteMedication = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { medId } = req.params;
    await Medication.delete(parseInt(medId), userId);
    res.status(200).json({ message: "Obat berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting medication" });
  }
};

// Mencatat obat telah diminum
export const logMedicationTaken = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { medId } = req.params;
    await Medication.logTaken(userId, parseInt(medId));
    res.status(200).json({ message: "Obat berhasil dicatat telah diminum" });
  } catch (error) {
    res.status(500).json({ message: "Server error while logging medication" });
  }
};
