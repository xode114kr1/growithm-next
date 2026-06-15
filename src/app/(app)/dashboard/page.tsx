import { auth } from "@/lib/auth/auth";

import DashboardContent from "./_components/dashboard-content";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="page-shell">
      <div className="page-container">
        <DashboardContent userId={session?.user?.id} />
      </div>
    </main>
  );
}
