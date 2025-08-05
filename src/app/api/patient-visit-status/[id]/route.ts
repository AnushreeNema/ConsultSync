import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { startOfDay } from "date-fns";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { seen, date } = await req.json();
  const patientId = params.id;
  const normalizedDate = startOfDay(new Date(date));

  const upserted = await prisma.patientVisitStatus.upsert({
    where: {
      patientId_date_userId: {
        patientId,
        date: normalizedDate,
        userId: session.user.id,
      },
    },
    update: { seen },
    create: {
      patientId,
      date: normalizedDate,
      seen,
      userId: session.user.id,
    },
  });

  return NextResponse.json(upserted);
}
