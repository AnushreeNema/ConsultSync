import { NextRequest, NextResponse } from "next/server";
import { startOfDay } from "date-fns";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dateParam = req.nextUrl.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();
  const normalizedDate = startOfDay(date);

  // 1. Get all patients for this user
  const patients = await prisma.patient.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // 2. Get all visit statuses for that user/date
  const visitStatuses = await prisma.patientVisitStatus.findMany({
    where: {
      date: normalizedDate,
      userId: session.user.id,
    },
  });

  const visitStatusMap = new Map<string, boolean>();
  visitStatuses.forEach((vs) => {
    visitStatusMap.set(vs.patientId, vs.seen);
  });

  // 3. Merge patient data with seen status
  const merged = patients.map((p) => ({
    ...p,
    seen: visitStatusMap.get(p.id) ?? false,
  }));

  return NextResponse.json(merged);
}
