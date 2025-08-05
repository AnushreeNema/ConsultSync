// actions/uploadAndExtract.ts
import { extractTextFromImage } from "@/lib/ocr";
import { parsePatientsFromText } from "@/utils/parsePatients";
import prisma from "@/lib/prisma";

export async function processUploadedImage(imageUrl: string, hospital: string) {
  const text = await extractTextFromImage(imageUrl);
  const parsed = parsePatientsFromText(text);

  const imageRecord = await prisma.patientImage.create({
    data: {
      url: imageUrl,
      hospital,
    },
  });

  const savedPatients = await Promise.all(
    parsed.map((p) =>
      prisma.patient.create({
        data: {
          ...p,
          imageId: imageRecord.id,
        },
      }),
    ),
  );

  return savedPatients;
}
