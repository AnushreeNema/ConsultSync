import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { status } = await req.json();

  const updated = await prisma.patient.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(updated);
}
