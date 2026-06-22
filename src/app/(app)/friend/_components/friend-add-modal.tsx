"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";

import type { FriendProfile, FriendSearchResult } from "@/types/friend";

import { SearchResultActions } from "./friend-action-buttons";
import { FriendProfileModal } from "./friend-profile-modal";

export function FriendAddModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequestIds, setPendingRequestIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedProfile, setSelectedProfile] = useState<FriendProfile | null>(
    null,
  );
  const titleId = useId();

  useEffect(() => {
    const query = searchQuery.trim();

    if (!isOpen || !query) {
      return;
    }

    async function searchUsers() {
      try {
        const searchParams = new URLSearchParams({ query });
        const response = await fetch(`/api/users?${searchParams}`);

        if (!response.ok) {
          setSearchResults([]);
          return;
        }

        setSearchResults((await response.json()) as FriendSearchResult[]);
      } catch {
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    searchUsers();
  }, [isOpen, searchQuery]);

  function closeModal() {
    setIsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setIsLoading(false);
  }

  function handleSearchQueryChange(query: string) {
    setSearchQuery(query);
    setSearchResults([]);
    setIsLoading(Boolean(query.trim()));
  }

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
            onClick={closeModal}
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
                onClick={closeModal}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto p-6">
              <FriendSearchInput
                onQueryChange={handleSearchQueryChange}
                query={searchQuery}
              />
              <SearchResultList
                isLoading={isLoading}
                onAddFriend={handleAddFriend}
                onOpenProfile={(profile) => {
                  closeModal();
                  setSelectedProfile(profile);
                }}
                pendingRequestIds={pendingRequestIds}
                query={searchQuery}
                results={searchResults}
              />
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

function FriendSearchInput({
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

function SearchResultList({
  isLoading,
  onAddFriend,
  onOpenProfile,
  pendingRequestIds,
  query,
  results,
}: {
  isLoading: boolean;
  onAddFriend: (profileId: string) => void;
  onOpenProfile: (profile: FriendSearchResult) => void;
  pendingRequestIds: Set<string>;
  query: string;
  results: FriendSearchResult[];
}) {
  const hasQuery = Boolean(query.trim());

  return (
    <section className="h-80 overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
      {!hasQuery ? (
        <p className="px-3 py-4 text-body-sm text-slate-500">
          추가할 친구의 이름을 입력하세요.
        </p>
      ) : isLoading ? (
        <p className="px-3 py-4 text-body-sm text-slate-500">검색 중...</p>
      ) : results.length === 0 ? (
        <div className="px-3 py-4">
          <div className="text-body-md font-semibold text-on-background">
            검색 결과가 없습니다.
          </div>
          <div className="mt-1 text-body-sm text-on-surface-variant">
            &quot;{query.trim()}&quot;과 일치하는 다른 이름을 검색해 보세요.
          </div>
        </div>
      ) : (
        <div className="grid h-full gap-2 overflow-y-auto">
          {results.map((profile) => (
            <div
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5"
              key={profile.id}
            >
              <button
                aria-label={`${profile.name} 프로필`}
                className="shrink-0 rounded-full outline-none transition-opacity hover:opacity-80 focus:ring-2 focus:ring-primary-container"
                onClick={() => onOpenProfile(profile)}
                type="button"
              >
                <Image
                  alt={`${profile.name} 아바타`}
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
