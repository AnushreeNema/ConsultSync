import { NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// INIT clients
const vision = new ImageAnnotatorClient({ keyFilename: "gcloud-key.json" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file") as File;
    const buffer = Buffer.from(await file.arrayBuffer());

    // OCR with Google Vision
    const [result] = await vision.textDetection({ image: { content: buffer } });
    const rawText = result.fullTextAnnotation?.text || "";

    // OpenAI parsing
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a parser for handwritten patient tables. Only return JSON like:
[
  {
    "name": "Sumit",
    "age": 24,
    "hospital": "Suyash",
    "ipd": 55,
    "charge": 500
  },
  ...
]`,
        },
        {
          role: "user",
          content: rawText,
        },
      ],
    });

    const responseText = completion.choices[0].message.content || "[]";

    let patients;
    try {
      patients = JSON.parse(responseText);
    } catch (err) {
      console.error("Parsing failed:", responseText);
      return NextResponse.json(
        { error: "Invalid JSON from AI." },
        { status: 400 },
      );
    }

    const savedPatients = [];

    for (const p of patients) {
      const saved = await prisma.patient.create({
        data: {
          name: p.name,
          age: p.age ?? null,
          hospital: p.hospital ?? "",
          ipdNumber: p.ipd ?? null,
          visitingCharge: p.charge ?? null,
          userId: session.user.id, //  Associate patient with user
        },
      });
      savedPatients.push(saved);
    }

    return NextResponse.json({ patients: savedPatients });
  } catch (error) {
    console.error("Error extracting text:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
