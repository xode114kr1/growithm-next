import type { FriendSearchResult } from "@/types/friend";

import { SearchResultItem } from "./search-result-item";

type SearchResultListProps = {
  onOpenProfile: (profile: FriendSearchResult) => void;
  query: string;
  results: FriendSearchResult[];
};

export function SearchResultList({
  onOpenProfile,
  query,
  results,
}: SearchResultListProps) {
  if (!query.trim()) {
    return (
      <section className="h-80 rounded-xl border border-slate-200 bg-white" />
    );
  }

  if (results.length === 0) {
    return (
      <section className="h-80 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-body-md font-semibold text-on-background">
          검색 결과가 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="h-80 overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
      <div className="grid h-full gap-2 overflow-y-auto">
        {results.map((profile) => (
          <SearchResultItem
            key={profile.id}
            onOpenProfile={onOpenProfile}
            profile={profile}
          />
        ))}
      </div>
    </section>
  );
}
