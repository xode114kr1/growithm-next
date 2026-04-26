import FriendNetwork from "@/app/(app)/friend/_components/friend-network";

export default function FriendPage() {
  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-28 text-on-background sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <div className="mb-2 flex items-center gap-2 text-body-sm text-slate-400">
            <span>Community</span>
            <span aria-hidden="true">›</span>
            <span className="font-medium text-primary">Developer Network</span>
          </div>
          <h1 className="mb-4 text-h1-editorial text-on-background">
            Connections
          </h1>
          <p className="max-w-2xl text-body-lg text-on-surface-variant">
            Manage your study circle, track friend progress, and collaborate on
            complex algorithmic challenges together.
          </p>
        </header>
        <FriendNetwork />
      </div>
    </main>
  );
}
