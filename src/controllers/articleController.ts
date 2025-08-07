import { Request, Response } from "express";
import { Article } from "../models/Article";

// Mendapatkan semua artikel (untuk ditampilkan di daftar)
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articles = await Article.findAllPublished();
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching articles" });
  }
};

// Mendapatkan detail satu artikel
export const getArticleBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const article = await Article.findBySlug(slug);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json(article);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching article details" });
  }
};

// (Untuk Admin) Membuat artikel baru
export const createArticle = async (req: Request, res: Response) => {
  try {
    // Anda bisa menambahkan validasi peran admin di middleware
    const articleData = req.body; // title, excerpt, content, dll.
    await Article.create(articleData);
    res.status(201).json({ message: "Article created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while creating article" });
  }
};
