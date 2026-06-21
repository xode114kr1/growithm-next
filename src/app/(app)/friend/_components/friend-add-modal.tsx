"use client";

import { Plus } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { FriendProfileModal } from "@/components/friend-profile-modal";
import type { FriendProfile, FriendSearchResult } from "@/types/friend";

import { FriendSearchInput, SearchResultList } from "./friend-search";

export function FriendAddModal({
  searchResults,
}: {
  searchResults: FriendSearchResult[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingRequestIds, setPendingRequestIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedProfile, setSelectedProfile] = useState<FriendProfile | null>(
    null,
  );
  const titleId = useId();
  const filteredSearchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return searchResults
      .filter((profile) =>
        profile.name.toLocaleLowerCase().includes(normalizedQuery),
      )
      .slice(0, 12);
  }, [searchQuery, searchResults]);

  function handleAddFriend(profileId: string) {
    setPendingRequestIds((current) => {
      const next = new Set(current);
      next.add(profileId);
      return next;
    });
  }

  return (
    <>
      <button
        aria-label="친구 추가"
        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary transition-opacity hover:opacity-90"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Plus aria-hidden="true" size={20} />
      </button>
      {isOpen ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-80 flex items-center justify-center bg-primary/25 px-4 py-8 backdrop-blur-sm"
          role="dialog"
        >
          <button
            aria-label="친구 추가 모달 닫기"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <section className="relative flex max-h-[calc(100svh-4rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-label-caps text-slate-400">새 친구</p>
                <h2 className="text-h3-ui text-primary" id={titleId}>
                  친구 추가
                </h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  이름으로 사용자를 검색해 친구 요청을 보내세요.
                </p>
              </div>
              <button
                aria-label="친구 추가 모달 닫기"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-xl font-semibold text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto p-6">
              <FriendSearchInput
                onQueryChange={setSearchQuery}
                query={searchQuery}
              />
              {searchQuery.trim() ? (
                <SearchResultList
                  onAddFriend={handleAddFriend}
                  onOpenProfile={(profile) => {
                    setIsOpen(false);
                    setSelectedProfile(profile);
                  }}
                  pendingRequestIds={pendingRequestIds}
                  query={searchQuery}
                  results={filteredSearchResults}
                />
              ) : (
                <p className="py-8 text-center text-body-sm text-slate-500">
                  추가할 친구의 이름을 입력하세요.
                </p>
              )}
            </div>
          </section>
        </div>
      ) : null}
      {selectedProfile ? (
        <FriendProfileModal
          onClose={() => setSelectedProfile(null)}
          profile={selectedProfile}
        />
      ) : null}
    </>
  );
}
