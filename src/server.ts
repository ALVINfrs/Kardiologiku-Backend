import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

const app = express();

// Konfigurasi CORS agar hanya bisa diakses oleh frontend Anda
const whitelist = ["http://localhost:5173"]; // Ganti dengan URL Vercel Anda saat deploy
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Izinkan request tanpa 'origin' (seperti dari Postman atau server-side) untuk development
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Endpoint untuk Gemini AI
app.post("/api/gemini-chat", async (req: Request, res: Response) => {
  const { conversationHistory, systemPrompt } = req.body;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return res
      .status(500)
      .json({ error: "Gemini API key not configured on server" });
  }

  if (!conversationHistory || !systemPrompt) {
    return res
      .status(400)
      .json({
        error: "Missing conversationHistory or systemPrompt in request body",
      });
  }

  try {
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [...systemPrompt, ...conversationHistory],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      throw new Error(
        `Gemini API error: ${apiResponse.statusText} - ${errorBody}`
      );
    }
    const data = await apiResponse.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/gemini-chat:", error.message);
    res.status(500).json({ error: "Failed to get response from Gemini API" });
  }
});

// Endpoint untuk Google Text-to-Speech
app.post("/api/google-tts", async (req: Request, res: Response) => {
  const { text, voiceConfig } = req.body;
  const googleApiKey = process.env.GOOGLE_TTS_API_KEY;

  if (!googleApiKey) {
    return res
      .status(500)
      .json({ error: "Google TTS API key not configured on server" });
  }

  if (!text || !voiceConfig) {
    return res
      .status(400)
      .json({ error: "Missing text or voiceConfig in request body" });
  }

  try {
    const apiResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: voiceConfig,
          audioConfig: { audioEncoding: "MP3" },
        }),
      }
    );

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      throw new Error(
        `Google TTS API error: ${apiResponse.statusText} - ${errorBody}`
      );
    }
    const data = await apiResponse.json();
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/google-tts:", error.message);
    res
      .status(500)
      .json({ error: "Failed to get response from Google TTS API" });
  }
});

app.listen(PORT, () => {
  console.log(
    `Backend server for Kardiologiku is running on http://localhost:${PORT}`
  );
});
