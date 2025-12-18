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
  const prompt = `Album cover for "${title}"${composer ? ` by ${composer}` : ""}. Abstract, stylized interpretation - NOT literal or photorealistic. Capture the emotion, not the dictionary meaning. Painterly, dreamy, or surreal aesthetic. Single unified image, no collage. Edge-to-edge, no text or borders.`;

  const response = await ai.models.generateContent({
    // model: "gemini-3-pro-image-preview",
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
