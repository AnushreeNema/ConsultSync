// src/app/api/patient/list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const patients = await prisma.patient.findMany();
  return NextResponse.json(patients);
}
