import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hospitals = await prisma.patient.findMany({
      where: {
        userId: session.user.id,
        // Correct way to exclude null hospitals
      },
      select: { hospital: true },
      distinct: ["hospital"],
    });

    const hospitalList: string[] = hospitals
      .map((h) => h.hospital)
      .filter((h): h is string => typeof h === "string");

    return NextResponse.json(hospitalList);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
