import Image from "next/image";

import { SearchResultActions } from "./friend-action-buttons";
import type { FriendSearchResult } from "@/types/friend";

export function FriendSearchInput({
  onQueryChange,
  query,
}: {
  onQueryChange: (query: string) => void;
  query: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-label-caps text-slate-500">
        친구 검색
      </span>
      <input
        autoFocus
        className="input-field"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="사용자 이름 입력"
        type="search"
        value={query}
      />
    </label>
  );
}

export function SearchResultList({
  onAddFriend,
  onOpenProfile,
  pendingRequestIds,
  query,
  results,
}: {
  onAddFriend: (profileId: string) => void;
  onOpenProfile: (profile: FriendSearchResult) => void;
  pendingRequestIds: Set<string>;
  query: string;
  results: FriendSearchResult[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3">
      {results.length === 0 ? (
        <div className="px-3 py-4">
          <div className="text-body-md font-semibold text-on-background">
            No developers found
          </div>
          <div className="mt-1 text-body-sm text-on-surface-variant">
            Try another name or check &quot;{query.trim()}&quot;.
          </div>
        </div>
      ) : (
        <div className="grid max-h-96 gap-2 overflow-y-auto">
          {results.map((profile) => (
            <div
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5"
              key={profile.id}
            >
              <button
                aria-label={`${profile.name} profile`}
                className="shrink-0 rounded-full outline-none transition-opacity hover:opacity-80 focus:ring-2 focus:ring-primary-container"
                onClick={() => onOpenProfile(profile)}
                type="button"
              >
                <Image
                  alt={`${profile.name} avatar`}
                  className="size-11 rounded-full object-cover ring-2 ring-slate-50"
                  height={44}
                  src={profile.avatar}
                  width={44}
                />
              </button>
              <div className="min-w-0 flex-1">
                <div className="truncate text-body-md font-semibold text-on-background">
                  {profile.name}
                </div>
              </div>
              <SearchResultActions
                isPending={pendingRequestIds.has(profile.id)}
                onAddFriend={() => onAddFriend(profile.id)}
                profile={profile}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
