// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadResult = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "patients", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer); // Send the buffer to the stream
  });

  return NextResponse.json({ url: uploadResult.secure_url });
}
