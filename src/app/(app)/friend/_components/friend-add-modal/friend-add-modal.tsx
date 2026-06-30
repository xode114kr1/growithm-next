"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { ProfileModal } from "@/components/ui/profile-modal";
import { useClickOutside } from "@/hooks/use-click-outside";
import { searchUsers } from "@/lib/users/user-api";
import type { FriendSearchResult } from "@/types/friend";

import { SearchResultList } from "./search-result-list";

export function FriendAddModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const modalRef = useRef<HTMLElement>(null);
  const titleId = useId();

  useEffect(() => {
    const query = searchQuery.trim();

    if (!isOpen || !query) {
      return;
    }

    async function loadSearchResults() {
      try {
        setSearchResults(await searchUsers(query));
      } catch {
        setSearchResults([]);
      }
    }

    loadSearchResults();
  }, [isOpen, searchQuery]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  useClickOutside({
    enabled: isOpen && !selectedUserId,
    onClickOutside: closeModal,
    ref: modalRef,
  });

  return (
    <>
      <button
        aria-label="친구 추가"
        className="flex h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-body-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        친구 추가
      </button>
      {isOpen ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-80 flex items-center justify-center bg-primary/25 px-4 py-8 backdrop-blur-sm"
          role="dialog"
        >
          <section
            className="relative flex max-h-[calc(100svh-4rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl shadow-slate-950/20"
            ref={modalRef}
          >
            <FriendAddModalHeader onClose={closeModal} titleId={titleId} />
            <div className="space-y-4 overflow-y-auto p-6">
              <FriendSearchInput
                onQueryChange={setSearchQuery}
                query={searchQuery}
              />
              <SearchResultList
                onOpenProfile={(profile) => {
                  setSelectedUserId(profile.id);
                }}
                query={searchQuery}
                results={searchResults}
              />
            </div>
          </section>
          {selectedUserId ? (
            <ProfileModal
              onClose={() => setSelectedUserId(null)}
              userId={selectedUserId}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function FriendAddModalHeader({
  onClose,
  titleId,
}: {
  onClose: () => void;
  titleId: string;
}) {
  return (
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
        onClick={onClose}
        type="button"
      >
        ×
      </button>
    </div>
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

