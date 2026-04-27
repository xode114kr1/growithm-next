import FriendNetwork from "@/app/(app)/friend/_components/friend-network";

export default function FriendPage() {
  return (
    <main className="page-shell">
      <div className="page-container">
        <header className="page-header">
          <div className="mb-2 flex items-center gap-2 text-body-sm text-slate-400">
            <span>Community</span>
            <span aria-hidden="true">›</span>
            <span className="font-medium text-primary">Developer Network</span>
          </div>
          <h1 className="page-title mb-3">Connections</h1>
          <p className="max-w-2xl text-body-md text-on-surface-variant">
            Manage your study circle, track friend progress, and collaborate on
            complex algorithmic challenges together.
          </p>
        </header>
        <FriendNetwork />
      </div>
    </main>
  );
}
