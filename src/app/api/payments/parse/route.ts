import { NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const vision = new ImageAnnotatorClient({ keyFilename: "gcloud-key.json" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File;

  const buffer = Buffer.from(await file.arrayBuffer());

  const [result] = await vision.textDetection({ image: { content: buffer } });
  const rawText = result.fullTextAnnotation?.text || "";

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that extracts payment records from OCR. Return JSON only. Format:
[
  {
    "name": "Sumit",
    "ipd": 101,
    "amount": 500
  },
  ...
]`,
      },
      { role: "user", content: rawText },
    ],
  });

  const jsonText = completion.choices[0].message.content || "[]";

  let parsed: any[] = [];
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 400 },
    );
  }

  // Try matching with database
  const matchedResults = await Promise.all(
    parsed.map(async (p) => {
      const found = await prisma.patient.findFirst({
        where: {
          userId: session.user.id,
          name: { contains: p.name, mode: "insensitive" },
          ipdNumber: p.ipd ?? undefined,
        },
      });

      return {
        ...p,
        matchStatus: found ? "matched" : "unmatched",
      };
    }),
  );

  return NextResponse.json(matchedResults);
}
