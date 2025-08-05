import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

interface PatientVisit {
  name: string;
  hospital: string | null;
  visitingCharge: number | null;
  dates: string[];
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const hospital = searchParams.get("hospital");

  if (!hospital) {
    return NextResponse.json([], { status: 400 });
  }

  const visits = await prisma.patientVisitStatus.findMany({
    where: {
      seen: true,
      patient: {
        hospital: hospital,
        userId: session.user.id, // 🔐 Ensure only this user's patients
      },
    },
    include: {
      patient: true,
    },
  });

  const grouped: Record<string, PatientVisit> = {};

  visits.forEach((v) => {
    const id = v.patient.id;
    if (!grouped[id]) {
      grouped[id] = {
        name: v.patient.name,
        hospital: v.patient.hospital,
        visitingCharge: v.patient.visitingCharge,
        dates: [],
      };
    }
    grouped[id].dates.push(v.date.toISOString());
  });

  return NextResponse.json(Object.values(grouped));
}
