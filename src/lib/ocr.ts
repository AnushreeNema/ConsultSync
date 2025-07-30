

// lib/ocr.ts
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  const formData = new URLSearchParams();
  formData.append("url", imageUrl);
  formData.append("apikey", process.env.OCR_SPACE_API_KEY!);

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  const json = await res.json();
  return json.ParsedResults?.[0]?.ParsedText || "";
}
