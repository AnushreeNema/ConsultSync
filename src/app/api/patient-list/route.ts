import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const patients = await prisma.patient.findMany({
      where: { userId: session.user.id }, // only fetch patient's own records
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(patients);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 },
    );
  }
}
