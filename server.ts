import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parser with increased limit for base64 images
app.use(express.json({ limit: "15mb" }));

// Initialize GoogleGenAI server-side with User-Agent header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/ocr", async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image data" });
    }

    // Standardize base64
    let cleanBase64 = image;
    let cleanMime = mimeType || "image/jpeg";
    if (image.includes(";base64,")) {
      const parts = image.split(";base64,");
      const match = parts[0].match(/data:(.*)/);
      if (match) {
        cleanMime = match[1];
      }
      cleanBase64 = parts[1];
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("Missing GEMINI_API_KEY env variable");
      return res.status(500).json({ error: "Gemini API key is not configured on the server. Please check the Settings > Secrets menu." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: cleanMime,
          },
        },
        "Extract the read-along passage or story text from this textbook page or paper worksheet. " +
        "Ensure the extracted text is fully accurate, easy to read, and free of page numbers, watermarks, background text, or noise. " +
        "Output ONLY the extracted, clean paragraphs, with no extra conversational remarks, markdown codes, or commentary. " +
        "If there are any visible typo errors, please fix them to make it ideal for children with dyslexia."
      ],
    });

    const text = response.text || "";
    return res.json({ text: text.trim() });
  } catch (error: any) {
    console.error("OCR API Error:", error);
    return res.status(500).json({ error: error?.message || "Failed to analyze image text" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite().catch(err => {
  console.error("Failed to start server:", err);
});
