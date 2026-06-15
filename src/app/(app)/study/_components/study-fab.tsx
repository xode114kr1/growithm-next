export default function StudyFab() {
  return (
    <div className="fixed bottom-8 right-6 z-40 flex flex-col items-end gap-4 sm:bottom-10 sm:right-10">
      <div className="group relative">
        <div className="pointer-events-none absolute bottom-full right-0 mb-4 whitespace-nowrap rounded bg-inverse-surface px-3 py-1 text-xs text-inverse-on-surface opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Start a New Study Session
        </div>
        <button
          aria-label="새 스터디 만들기"
          className="flex size-14 items-center justify-center rounded-full bg-primary text-3xl text-on-primary shadow-2xl transition-all hover:scale-110 active:scale-95"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}
