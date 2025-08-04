import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, seen } = await req.json();

  if (!id || typeof seen !== "boolean") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Ensure patient belongs to the current user
  const existing = await prisma.patient.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.patient.update({
    where: { id },
    data: { seen },
  });

  return NextResponse.json(updated);
}
