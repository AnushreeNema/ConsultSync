// src/app/api/patient/updateStatus/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { id, status } = await req.json();
  try {
    await prisma.patient.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
