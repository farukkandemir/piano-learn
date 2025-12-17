import { Router } from "express";
import type { Request, Response } from "express";
import { generateCoverImage } from "../services/ai.js";
import { supabase, COVER_IMAGES_BUCKET } from "../lib/supabase.js";

const router = Router();

// POST /api/covers/generate
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { title, composer, songId } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    // Generate the image (returns base64 data URL)
    const imageDataUrl = await generateCoverImage(title, composer);

    // Extract base64 data and mime type
    const matches = imageDataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid image data format");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const extension = mimeType.split("/")[1] || "png";
    const filename = `${songId || crypto.randomUUID()}.${extension}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(COVER_IMAGES_BUCKET)
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(COVER_IMAGES_BUCKET)
      .getPublicUrl(filename);

    res.json({
      success: true,
      imageUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Error generating cover:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Failed to generate cover", details: message });
  }
});

export default router;
