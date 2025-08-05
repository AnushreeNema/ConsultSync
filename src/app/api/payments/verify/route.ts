import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import OpenAI from "openai";
import { auth } from "@/auth";
import { format } from "date-fns";

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

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // OCR
    const [visionResult] = await vision.textDetection({
      image: { content: buffer },
    });
    const rawText = visionResult.fullTextAnnotation?.text || "";

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "OCR returned no text" },
        { status: 400 },
      );
    }

    // OpenAI Parsing
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `Extract payment data and return JSON in this format:
[
  {
    "name": "Sumit",
    "ipd": 55,
    "amountPaid": 1000,
    "datesPaid": ["2025-08-01", "2025-08-02"]
  },
  ...
]`,
        },
        { role: "user", content: rawText },
      ],
    });

    const aiResponse = completion.choices?.[0]?.message?.content ?? "";
    let parsed;

    try {
      parsed = JSON.parse(aiResponse);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", aiResponse);
      return NextResponse.json(
        { error: "Failed to parse OpenAI response", rawResponse: aiResponse },
        { status: 400 },
      );
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { error: "Parsed data is not an array", rawResponse: parsed },
        { status: 400 },
      );
    }

    // Match and verify payments
    const results = await Promise.all(
      parsed.map(async (p: any) => {
        const patient = await prisma.patient.findFirst({
          where: {
            userId: session.user.id,
            name: { contains: p.name, mode: "insensitive" },
            ...(p.ipd ? { ipdNumber: p.ipd } : {}),
          },
        });

        if (!patient) {
          return {
            name: p.name,
            ipd: p.ipd ?? "N/A",
            expectedAmount: 0,
            paidAmount: p.amountPaid ?? 0,
            status: "Check",
            missingDates: ["Patient not found"],
          };
        }

        const visitRecords = await prisma.patientVisitStatus.findMany({
          where: {
            userId: session.user.id,
            patientId: patient.id,
            seen: true,
          },
        });

        const expectedAmount =
          (patient.visitingCharge ?? 0) * visitRecords.length;

        const normalizedDatesPaid = (p.datesPaid ?? []).map((d: string) =>
          format(new Date(d), "yyyy-MM-dd"),
        );

        const missingDates = visitRecords
          .map((v) => format(new Date(v.date), "yyyy-MM-dd"))
          .filter((d) => !normalizedDatesPaid.includes(d));

        return {
          name: p.name,
          ipd: p.ipd ?? "N/A",
          expectedAmount,
          paidAmount: p.amountPaid ?? 0,
          status:
            (p.amountPaid ?? 0) === expectedAmount && missingDates.length === 0
              ? "OK"
              : "Check",
          missingDates,
        };
      }),
    );

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Unexpected error in payments verification:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 },
    );
  }
}
