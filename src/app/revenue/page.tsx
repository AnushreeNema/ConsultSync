import prisma from "@/lib/prisma";

export default async function RevenuePage() {
  const patients = await prisma.patient.findMany({ where: { status: "seen" } });
  const total = patients.reduce((sum, p) => sum + (p.visitingCharge ?? 0), 0);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Revenue Summary</h1>
      <p className="text-xl">Total Revenue: ₹{total}</p>
    </main>
  );
}
