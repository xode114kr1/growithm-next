export default function FriendHeader() {
  return (
    <header className="page-header flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="page-title mb-2">Connections</h1>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          Manage your study circle, track friend progress, and collaborate on
          complex algorithmic challenges together.
        </p>
      </div>
    </header>
  );
}
