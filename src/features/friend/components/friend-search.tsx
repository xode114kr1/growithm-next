import { SearchResultActions } from "@/features/friend/components/friend-action-buttons";
import { ProfileCard } from "@/features/friend/components/friend-profile-card";
import type { FriendSearchResult } from "@/features/friend/types";

export function FriendSearchInput({
  onQueryChange,
  query,
}: {
  onQueryChange: (query: string) => void;
  query: string;
}) {
  return (
    <form className="flex w-full gap-2 md:w-auto" method="get">
      <label className="relative min-w-0 flex-1 md:w-96">
        <span
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        >
          Search
        </span>
        <input
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-20 pr-4 text-body-md shadow-sm outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
          name="query"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Find developers..."
          type="text"
          value={query}
        />
      </label>
      <button
        className="rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}

export function SearchResultList({
  onAddFriend,
  pendingRequestNames,
  query,
  results,
}: {
  onAddFriend: (profileName: string) => void;
  pendingRequestNames: Set<string>;
  query: string;
  results: FriendSearchResult[];
}) {
  if (results.length === 0) {
    return (
      <section className="app-card p-8 text-center">
        <h2 className="section-title mb-2 text-on-background">
          No developers found
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Try another name or check the spelling for &quot;{query.trim()}&quot;.
        </p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4">
      {results.map((profile) => (
        <ProfileCard key={profile.name} profile={profile}>
          <SearchResultActions
            isPending={pendingRequestNames.has(profile.name)}
            onAddFriend={() => onAddFriend(profile.name)}
            profile={profile}
          />
        </ProfileCard>
      ))}
    </section>
  );
}
