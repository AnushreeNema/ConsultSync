import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SeenPatients from "@/components/Seen";
import DashboardLayout from "@/components/DashboardLayout";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Extract only available parts of session.user
  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SeenPatients will show at the top always */}

      {/* Main Dashboard UI */}
      <DashboardLayout user={user} />
    </div>
  );
}
