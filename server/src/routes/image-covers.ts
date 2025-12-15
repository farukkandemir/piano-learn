import { Router } from "express";
import type { Request, Response } from "express";
import { generateCoverImage } from "../services/ai.js";

const router = Router();

// POST /api/covers/generate
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { title, composer } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const imageData = await generateCoverImage(title, composer);

    // TODO: Call AI service
    res.json({
      success: true,
      image: imageData,
    });
  } catch (error) {
    console.error("Error generating cover:", error);
    res.status(500).json({ error: "Failed to generate cover" });
  }
});

export default router;
