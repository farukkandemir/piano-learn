import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateCoverImage(
  title: string,
  composer?: string
): Promise<string> {
  const prompt = `Create a stunning artwork for the piano piece "${title}"${
    composer ? ` composed by ${composer}` : ""
  }.

Research and reflect the musical style, era, and emotional character of ${
    composer ? `${composer}'s compositions` : "this piece based on its title"
  }.

The image should:
- Visually capture the mood and emotion of this specific piece
- Include subtle musical elements (piano keys, sheet music fragments, musical notes)
- Have an elegant, premium feel
- Use colors and atmosphere that match the piece's character
- Feel authentic to the composer's era and style

Create the artwork only, without any album case, CD case, frame, border, or mockup. Just the raw artwork image that fills the entire canvas.

Style: Cinematic, artistic with dramatic lighting.
No text, letters, or words in the image.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
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
