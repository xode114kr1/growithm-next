import { auth } from "@/lib/auth/auth";

import DashboardContent from "./_components/dashboard-content";
import DashboardHeader from "./_components/dashboard-header";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="page-shell">
      <div className="page-container">
        <DashboardHeader />
        <DashboardContent userId={session?.user?.id} />
      </div>
    </main>
  );
}
