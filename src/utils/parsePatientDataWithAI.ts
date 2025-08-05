// utils/parsePatientDataWithAI.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parsePatientDataWithAI(rawText: string) {
  const prompt = `
You are an expert at extracting structured data from messy OCR text.

Given the following text, extract a JSON array where each item includes:
- name (string)
- age (number, optional)
- ipdNumber (string, optional)
- hospital (string)
- visitingCharge (number)

OCR TEXT:
"""
${rawText}
"""

Return only the JSON array.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  try {
    const jsonText = completion.choices[0].message.content?.trim();
    return JSON.parse(jsonText!);
  } catch (err) {
    console.error("Error parsing GPT response:", err);
    return [];
  }
}
