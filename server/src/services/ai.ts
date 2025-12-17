import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateCoverImage(
  title: string,
  composer?: string
): Promise<string> {
  const prompt = `Album cover art for "${title}"${composer ? ` by ${composer}` : ""}.

Create imagery inspired by the meaning and emotion of this piece's title. Each song should have unique artwork that reflects its character - not generic piano imagery.

Cinematic, artistic style. Objects must look natural, not distorted. Fill entire canvas edge-to-edge. No frames, borders, white backgrounds, mockups, or text.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
    config: {
      responseModalities: ["image", "text"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  const imagePart = parts?.find((p: any) =>
    p.inlineData?.mimeType?.startsWith("image/")
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("No image generated");
  }

  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
}
