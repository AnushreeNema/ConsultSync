// src/app/api/patients/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure the patient exists and belongs to the user
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
  });

  if (!patient || patient.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // First delete related visit status entries
  await prisma.patientVisitStatus.deleteMany({
    where: {
      patientId: params.id,
      userId: session.user.id,
    },
  });

  // Then delete the patient record
  await prisma.patient.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Patient deleted successfully." });
}
